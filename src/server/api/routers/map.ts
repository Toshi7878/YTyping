import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { db } from "@/server/drizzle/client";
import { MapDifficulties, MapLikes, Maps, Users } from "@/server/drizzle/schema";
import { UpsertMapSchema } from "@/server/drizzle/validator/map";
import type { MapLine } from "@/server/drizzle/validator/map-json";
import { downloadFile, upsertFile } from "@/utils/r2-storage";
import { protectedProcedure, publicProcedure } from "../trpc";

export const mapRouter = {
  getMapInfo: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { mapId } = input;

    const mapInfo = await db
      .select({
        title: Maps.title,
        videoId: Maps.videoId,
        artistName: Maps.artistName,
        musicSource: Maps.musicSource,
        previewTime: Maps.previewTime,
        thumbnailQuality: Maps.thumbnailQuality,
        hasLiked: MapLikes.hasLiked,
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
      .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user.id)))
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
      const data = await downloadFile({
        key: `map-json/${input.mapId}.json`,
      });

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
      let newMapId: number;

      if (mapId === null) {
        newMapId = await tx
          .insert(Maps)
          .values({ ...mapInfo, creatorId: userId })
          .returning({ id: Maps.id })
          .then((res) => res[0].id);
      } else {
        newMapId = await tx
          .update(Maps)
          .set({ ...mapInfo, ...(isMapDataEdited ? { updatedAt: new Date() } : {}) })
          .where(eq(Maps.id, mapId))
          .returning({ id: Maps.id })
          .then((res) => res[0].id);
      }

      await tx
        .insert(MapDifficulties)
        .values({ mapId: newMapId, ...mapDifficulty })
        .onConflictDoUpdate({ target: [MapDifficulties.mapId], set: mapDifficulty });

      await upsertFile({
        key: `map-json/${mapId === null ? newMapId : mapId}.json`,
        body: JSON.stringify(mapData, null, 2),
        contentType: "application/json",
      });

      return newMapId;
    });

    return {
      id: mapId === null ? newMapId : mapId,
      title: mapId === null ? "アップロード完了" : "アップデート完了",
    };
  }),
} satisfies TRPCRouterRecord;
