import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, eq, max, sql } from "drizzle-orm";
import z from "zod";
import { downloadPublicFile, uploadPublicFile } from "@/server/api/utils/storage";
import { db } from "@/server/drizzle/client";
import { MapDifficulties, MapLikes, Maps, Users } from "@/server/drizzle/schema";
import { UpsertMapSchema } from "@/validator/map";
import type { MapLine } from "@/validator/map-json";
import { protectedProcedure, publicProcedure } from "../trpc";

export const mapRouter = {
  getMapInfo: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    const mapInfo = await db
      .select({
        id: Maps.id,
        title: Maps.title,
        videoId: Maps.videoId,
        artistName: Maps.artistName,
        musicSource: Maps.musicSource,
        previewTime: Maps.previewTime,
        thumbnailQuality: Maps.thumbnailQuality,
        hasLiked: sql<boolean>`COALESCE(${MapLikes.hasLiked}, false)`,
        tags: Maps.tags,
        creator: {
          id: Users.id,
          name: Users.name,
          comment: Maps.creatorComment,
        },
        createdAt: Maps.createdAt,
        updatedAt: Maps.updatedAt,
      })
      .from(Maps)
      .innerJoin(Users, eq(Users.id, Maps.creatorId))
      .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user?.id ?? 0)))
      .where(eq(Maps.id, mapId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!mapInfo) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return mapInfo;
  }),

  getMapJson: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input }) => {
    try {
      const data = await downloadPublicFile(`map-json/${input.mapId}.json`);

      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Map data not found" });
      }

      const jsonString = new TextDecoder().decode(data);
      const mapJson: MapLine[] = JSON.parse(jsonString);

      return mapJson;
    } catch (error) {
      console.error("Error fetching map data from R2:", error);
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }
  }),

  upsertMap: protectedProcedure.input(UpsertMapSchema).mutation(async ({ input, ctx }) => {
    const { mapId, isMapDataEdited, mapData, mapInfo, mapDifficulty } = input;
    const userId = ctx.user.id;
    const userRole = ctx.user.role;

    const hasUpsertPermission =
      mapId === null
        ? true
        : await ctx.db.query.Maps.findFirst({
            columns: { creatorId: true },
            where: eq(Maps.id, mapId),
          }).then((row) => row?.creatorId === userId || userRole === "ADMIN");

    if (!hasUpsertPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "この譜面を保存する権限がありません",
      });
    }

    const newMapId = await db.transaction(async (tx) => {
      let newId: number | undefined;

      if (mapId === null) {
        const maxId = await tx
          .select({ maxId: max(Maps.id) })
          .from(Maps)
          .then((rows) => rows[0]?.maxId ?? 0);

        const nextId = maxId + 1;

        newId = await tx
          .insert(Maps)
          .values({ id: nextId, ...mapInfo, creatorId: userId })
          .returning({ id: Maps.id })
          .then((res) => res[0]?.id);
      } else {
        newId = await tx
          .update(Maps)
          .set({ ...mapInfo, ...(isMapDataEdited ? { updatedAt: new Date() } : {}) })
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
        body: JSON.stringify(mapData, null, 2),
        contentType: "application/json",
      });

      return newId;
    });

    return { id: newMapId, creatorId: userId };
  }),
} satisfies TRPCRouterRecord;
