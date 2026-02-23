import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, eq, max, sql } from "drizzle-orm";
import z from "zod";
import { downloadPublicFile, uploadPublicFile } from "@/server/api/utils/storage";
import type { TXType } from "@/server/drizzle/client";
import { MAP_CATEGORIES, MapDifficulties, MapLikes, Maps, Users } from "@/server/drizzle/schema";
import { UpsertMapSchema } from "@/validator/map";
import type { RawMapLine } from "@/validator/raw-map-json";
import { buildHasBookmarkedMapExists } from "../../lib/map";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const mapDetailRouter = {
  get: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    const mapInfo = await db
      .select({
        id: Maps.id,
        media: {
          previewTime: Maps.previewTime,
          thumbnailQuality: Maps.thumbnailQuality,
          videoId: Maps.videoId,
        },
        info: {
          tags: Maps.tags,
          title: Maps.title,
          artistName: Maps.artistName,
          source: Maps.musicSource,
          duration: Maps.duration,
          visibility: Maps.visibility,
        },
        creator: {
          id: Users.id,
          name: Users.name,
          comment: Maps.creatorComment,
        },
        difficulty: {
          romaKpmMedian: MapDifficulties.romaKpmMedian,
          kanaKpmMedian: MapDifficulties.kanaKpmMedian,
          romaKpmMax: MapDifficulties.romaKpmMax,
          kanaKpmMax: MapDifficulties.kanaKpmMax,
          romaTotalNotes: MapDifficulties.romaTotalNotes,
          kanaTotalNotes: MapDifficulties.kanaTotalNotes,
        },
        like: {
          hasLiked: sql`COALESCE(${MapLikes.hasLiked}, false)`.mapWith(Boolean),
        },
        bookmark: {
          hasBookmarked: user ? buildHasBookmarkedMapExists(user) : sql`false`.mapWith(Boolean),
        },
        createdAt: Maps.createdAt,
        updatedAt: Maps.updatedAt,
      })
      .from(Maps)
      .innerJoin(Users, eq(Users.id, Maps.creatorId))
      .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
      .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user?.id ?? 0)))
      .where(eq(Maps.id, mapId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!mapInfo) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return mapInfo;
  }),

  getJson: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input }) => {
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

  upsert: protectedProcedure.input(UpsertMapSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId, isMapDataEdited, rawMapJson, mapInfo, mapDifficulty } = input;
    const userId = user.id;
    const userRole = user.role;

    const existingMapRow =
      typeof mapId === "number"
        ? await db.query.Maps.findFirst({
            columns: { publishedAt: true, creatorId: true },
            where: eq(Maps.id, mapId),
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
          .insert(Maps)
          .values({
            id: nextId,
            ...mapInfo,
            creatorId: userId,
            category: getMapCategories(rawMapJson),
            publishedAt: mapInfo.visibility === "PUBLIC" ? new Date() : undefined,
            visibility: "PUBLIC",
          })
          .returning({ id: Maps.id })
          .then((res) => res[0]?.id);
      } else {
        newId = await tx
          .update(Maps)
          .set({
            ...mapInfo,
            category: getMapCategories(rawMapJson),
            ...(isMapDataEdited ? { updatedAt: new Date() } : {}),
            ...(existingMapRow?.publishedAt === null && mapInfo.visibility === "PUBLIC"
              ? { publishedAt: new Date() }
              : {}),
          })
          .where(eq(Maps.id, mapId))
          .returning({ id: Maps.id })
          .then((res) => res[0]?.id);
      }

      if (!newId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED" });
      }

      await tx
        .insert(MapDifficulties)
        .values({ mapId: newId, ...mapDifficulty })
        .onConflictDoUpdate({ target: [MapDifficulties.mapId], set: mapDifficulty });

      await uploadPublicFile({
        key: `map-json/${mapId === null ? newId : mapId}.json`,
        body: JSON.stringify(rawMapJson, null, 2),
        contentType: "application/json",
      });

      return newId;
    });

    return { id: newMapId, creatorId: userId };
  }),
} satisfies TRPCRouterRecord;

const getNextMapId = async (db: TXType) => {
  const maxId = await db
    .select({ maxId: max(Maps.id) })
    .from(Maps)
    .then((rows) => rows[0]?.maxId ?? 0);

  return maxId + 1;
};

type MapCategory = (typeof MAP_CATEGORIES)[number];

const getMapCategories = (rawMap: z.output<typeof UpsertMapSchema>["rawMapJson"]): MapCategory[] => {
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
