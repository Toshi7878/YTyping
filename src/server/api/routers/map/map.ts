import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, eq, max, sql } from "drizzle-orm";
import { buildTypingMap } from "lyrics-typing-engine";
import z from "zod";
import { downloadPublicFile, uploadPublicFile } from "@/server/api/lib/storage";
import type { TXType } from "@/server/drizzle/client";
import { MAP_CATEGORIES, mapDifficulties, mapLikes, maps, users } from "@/server/drizzle/schema";
import { upsertMapItemSchema } from "@/validator/map/map";
import { type RawMapLine, RawMapLineSchema } from "@/validator/map/raw-map-json";
import { calcRating } from "../../../../domain/map/rating/calc";
import { bookmarkedMapExists } from "../../lib/map";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { mapBookmarkListItemRouter } from "./bookmark/list-item";
import { mapBookmarkListsRouter } from "./bookmark/lists";
import { mapLikeRouter } from "./like";
import { mapListRouter } from "./list";

export const mapRouter = {
  getById: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { mapId } = input;

    const mapInfo = await db
      .select({
        id: maps.id,
        media: {
          previewTime: maps.previewTime,
          thumbnailQuality: maps.thumbnailQuality,
          videoId: maps.videoId,
        },
        info: {
          tags: maps.tags,
          title: maps.title,
          artistName: maps.artistName,
          source: maps.musicSource,
          duration: maps.duration,
          visibility: maps.visibility,
        },
        creator: {
          id: users.id,
          name: users.name,
          comment: maps.creatorComment,
        },
        difficulty: {
          romaKpmMedian: mapDifficulties.romaKpmMedian,
          kanaKpmMedian: mapDifficulties.kanaKpmMedian,
          romaKpmMax: mapDifficulties.romaKpmMax,
          kanaKpmMax: mapDifficulties.kanaKpmMax,
          romaTotalNotes: mapDifficulties.romaTotalNotes,
          kanaTotalNotes: mapDifficulties.kanaTotalNotes,
          rating: mapDifficulties.rating,
        },
        like: {
          hasLiked: sql`COALESCE(${mapLikes.hasLiked}, false)`.mapWith(Boolean),
        },
        bookmark: {
          hasBookmarked: session ? bookmarkedMapExists(db, session) : sql`false`.mapWith(Boolean),
        },
        createdAt: maps.createdAt,
        updatedAt: maps.updatedAt,
      })
      .from(maps)
      .innerJoin(users, eq(users.id, maps.creatorId))
      .innerJoin(mapDifficulties, eq(mapDifficulties.mapId, maps.id))
      .leftJoin(mapLikes, and(eq(mapLikes.mapId, maps.id), eq(mapLikes.userId, session?.user.id ?? 0)))
      .where(eq(maps.id, mapId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!mapInfo) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return mapInfo;
  }),

  getJsonById: publicProcedure
    .input(z.object({ mapId: z.number() }))
    .output(z.array(RawMapLineSchema))
    .query(async ({ input }) => {
      try {
        const data = await downloadPublicFile(`map-json/${input.mapId}.json`);

        if (!data) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Map data not found" });
        }

        const jsonString = new TextDecoder().decode(data);
        const mapJson: RawMapLine[] = JSON.parse(jsonString);

        return mapJson;
      } catch (error) {
        console.error("Error fetching map data from R2:", error);
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),

  upsert: protectedProcedure.input(upsertMapItemSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { mapId, isMapDataEdited, rawMapJson, mapInfo, mapDifficulty } = input;
    const { id: userId, role: userRole } = session.user;

    const existingMapRow =
      typeof mapId === "number"
        ? await db.query.maps.findFirst({
            columns: { publishedAt: true, creatorId: true },
            where: { id: mapId },
          })
        : null;

    const hasUpsertPermission = mapId === null ? true : existingMapRow?.creatorId === userId || userRole === "ADMIN";

    if (!hasUpsertPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "この譜面を保存する権限がありません",
      });
    }

    const newMapId = await db.transaction(async (tx) => {
      let newId: number | undefined;

      if (mapId === null) {
        const nextId = await getNextMapId(tx);

        newId = await tx
          .insert(maps)
          .values({
            id: nextId,
            ...mapInfo,
            creatorId: userId,
            category: getMapCategories(rawMapJson),
            publishedAt: mapInfo.visibility === "PUBLIC" ? new Date() : undefined,
            visibility: mapInfo.visibility,
          })
          .returning({ id: maps.id })
          .then((res) => res[0]?.id);
      } else {
        newId = await tx
          .update(maps)
          .set({
            ...mapInfo,
            category: getMapCategories(rawMapJson),
            ...(isMapDataEdited ? { updatedAt: new Date() } : {}),
            ...(existingMapRow?.publishedAt === null && mapInfo.visibility === "PUBLIC"
              ? { publishedAt: new Date() }
              : {}),
          })
          .where(eq(maps.id, mapId))
          .returning({ id: maps.id })
          .then((res) => res[0]?.id);
      }

      if (!newId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED" });
      }

      const builtMapLines = buildTypingMap({ rawMapLines: rawMapJson, charPoint: 0 });
      const rating = calcRating(builtMapLines);

      await tx
        .insert(mapDifficulties)
        .values({ mapId: newId, ...mapDifficulty, rating })
        .onConflictDoUpdate({ target: [mapDifficulties.mapId], set: { ...mapDifficulty, rating } });

      await uploadPublicFile({
        key: `map-json/${mapId === null ? newId : mapId}.json`,
        body: JSON.stringify(rawMapJson, null, 2),
        contentType: "application/json",
      });

      return newId;
    });

    return { id: newMapId, creatorId: userId };
  }),

  list: mapListRouter,
  like: mapLikeRouter,
  bookmark: { lists: mapBookmarkListsRouter, listItem: mapBookmarkListItemRouter },
} satisfies TRPCRouterRecord;

const getNextMapId = async (db: TXType) => {
  const maxId = await db
    .select({ maxId: max(maps.id) })
    .from(maps)
    .then((rows) => rows[0]?.maxId ?? 0);

  return maxId + 1;
};

type MapCategory = (typeof MAP_CATEGORIES)[number];

const getMapCategories = (rawMap: z.output<typeof upsertMapItemSchema>["rawMapJson"]): MapCategory[] => {
  const categories = new Set<MapCategory>();

  for (const line of rawMap) {
    const options = line.options;
    if (!options) continue;

    const hasCss =
      options.isChangeCSS === true ||
      (typeof options.changeCSS === "string" && options.changeCSS.trim().length > 0) ||
      (typeof options.eternalCSS === "string" && options.eternalCSS.trim().length > 0);
    if (hasCss) categories.add("CSS");

    const hasSpeedShift = typeof options.changeVideoSpeed === "number" && options.changeVideoSpeed !== 0;
    if (hasSpeedShift) categories.add("SPEED_SHIFT");

    const hasCaseSensitive = options.isCaseSensitive;
    if (hasCaseSensitive) categories.add("CASE_SENSITIVE");

    if (categories.size >= MAP_CATEGORIES.length) break;
  }

  return Array.from(categories);
};
