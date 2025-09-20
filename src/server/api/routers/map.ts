import { supabase } from "@/lib/supabaseClient";
import { db } from "@/server/drizzle/client";
import { MapDifficulties, MapLikes, Maps, Users } from "@/server/drizzle/schema";
import { UpsertMapSchema } from "@/server/drizzle/validator/map";
import { MapLine } from "@/types/map";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
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
    const timestamp = new Date().getTime();

    const { data, error } = await supabase.storage
      .from("map-data")
      .download(`public/${input.mapId}.json?timestamp=${timestamp}`);

    if (error) {
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    }

    const jsonString = await data.text();
    const mapJson: MapLine[] = JSON.parse(jsonString);

    return mapJson;
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

      await supabase.storage
        .from("map-data")
        .upload(
          `public/${mapId === null ? newMapId : mapId}.json`,
          new Blob([JSON.stringify(mapData, null, 2)], { type: "application/json" }),
          { upsert: true },
        );

      return newMapId;
    });

    return {
      id: mapId === null ? newMapId : mapId,
      title: mapId === null ? "アップロード完了" : "アップデート完了",
    };
  }),
};
