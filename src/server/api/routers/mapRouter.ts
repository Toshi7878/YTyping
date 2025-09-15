import { supabase } from "@/lib/supabaseClient";
import { db as drizzleDb } from "@/server/drizzle/client";
import { MapDifficulties, MapLikes, Maps, Users } from "@/server/drizzle/schema";
import { MapLine } from "@/types/map";
import { mapDataSchema } from "@/validator/mapDataSchema";
import { mapInfoApiSchema } from "@/validator/schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

const mapDifficultySchema = z.object({
  roma_kpm_median: z.number(),
  roma_kpm_max: z.number(),
  kana_kpm_median: z.number(),
  kana_kpm_max: z.number(),
  total_time: z.number(),
  roma_total_notes: z.number(),
  kana_total_notes: z.number(),
});

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
        hasLiked: MapLikes.isLiked,
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
      throw new TRPCError({
        code: "NOT_FOUND",
      });
    }

    return mapInfo;
  }),

  getMap: publicProcedure.input(z.object({ mapId: z.string() })).query(async ({ input }) => {
    try {
      const timestamp = new Date().getTime();

      const { data, error } = await supabase.storage
        .from("map-data") // バケット名を指定
        .download(`public/${input.mapId}.json?timestamp=${timestamp}`);

      if (error) {
        console.error("Error downloading from Supabase:", error);
        throw error;
      }

      const jsonString = await data.text();
      const rawMapData: MapLine[] = JSON.parse(jsonString);

      return rawMapData;
    } catch (error) {
      console.error("Error processing the downloaded file:", error);
      throw error;
    }
  }),

  upsertMap: protectedProcedure
    .input(
      z.object({
        mapInfo: mapInfoApiSchema,
        mapDifficulty: mapDifficultySchema,
        mapData: mapDataSchema,
        isMapDataEdited: z.boolean(),
        mapId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { mapId, isMapDataEdited, mapData, mapInfo, mapDifficulty } = input;
      const userId = Number(ctx.user.id);
      const userRole = ctx.user.role;

      const hasUpsertPermission =
        mapId === "new"
          ? true
          : await ctx.db
              .select({ creator_id: Maps.creatorId })
              .from(Maps)
              .where(eq(Maps.id, Number(mapId)))
              .limit(1)
              .then((rows) => rows[0]?.creator_id === userId || userRole === "ADMIN");

      if (!hasUpsertPermission) {
        return {
          id: null,
          title: "保存に失敗しました",
          message: "この譜面を保存する権限がありません",
          status: 403,
        };
      }

      try {
        const newMapId = await upsertMap({
          mapInfo,
          mapDifficulty,
          mapId,
          userId,
          isMapDataEdited,
          mapData,
        });

        return {
          id: mapId === "new" ? newMapId : null,
          title: mapId === "new" ? "アップロード完了" : "アップデート完了",
          message: "",
          status: 200,
        };
      } catch (error) {
        return {
          id: null,
          title: "サーバー側で問題が発生しました",
          message: "しばらく時間をおいてから再度お試しください。",
          status: 500,
          errorObject: error instanceof Error ? error.message : String(error),
        };
      }
    }),
};

const upsertMap = async ({
  mapInfo,
  mapDifficulty,
  mapId,
  userId,
  isMapDataEdited,
  mapData,
}: {
  mapInfo: z.infer<typeof mapInfoApiSchema>;
  mapDifficulty: z.infer<typeof mapDifficultySchema>;
  mapId: string;
  userId: number;
  isMapDataEdited: boolean;
  mapData: z.infer<typeof mapDataSchema>;
}) => {
  return await drizzleDb.transaction(async (tx) => {
    try {
      const mapValues = {
        videoId: mapInfo.videoId,
        title: mapInfo.title,
        artistName: mapInfo.artistName,
        musicSource: mapInfo.musicSource,
        creatorComment: mapInfo.creatorComment,
        tags: mapInfo.tags,
        creatorId: userId,
        previewTime: Number(mapInfo.previewTime),
        thumbnailQuality: mapInfo.thumbnailQuality,
      } as const;

      const inserted = await tx
        .insert(Maps)
        .values(mapValues)
        .onConflictDoUpdate({
          target: [Maps.id],
          set: { ...mapValues, ...(isMapDataEdited ? { updatedAt: new Date() } : {}) },
        })
        .returning({ id: Maps.id });

      const newMapId = mapId === "new" ? inserted[0]!.id : Number(mapId);

      const diffValues = {
        mapId: newMapId,
        romaKpmMedian: mapDifficulty.roma_kpm_median,
        romaKpmMax: mapDifficulty.roma_kpm_max,
        kanaKpmMedian: mapDifficulty.kana_kpm_median,
        kanaKpmMax: mapDifficulty.kana_kpm_max,
        totalTime: mapDifficulty.total_time,
        romaTotalNotes: mapDifficulty.roma_total_notes,
        kanaTotalNotes: mapDifficulty.kana_total_notes,
        englishTotalNotes: 0,
        symbolTotalNotes: 0,
        intTotalNotes: 0,
      } as const;

      await tx
        .insert(MapDifficulties)
        .values(diffValues)
        .onConflictDoUpdate({ target: [MapDifficulties.mapId], set: { ...diffValues } });

      await supabase.storage
        .from("map-data")
        .upload(
          `public/${mapId === "new" ? newMapId : mapId}.json`,
          new Blob([JSON.stringify(mapData, null, 2)], { type: "application/json" }),
          {
            upsert: true,
          },
        );

      return newMapId;
    } catch (error) {
      console.error("DB Error:", error);
      if (error instanceof Error) {
        throw new Error(`データベース操作に失敗しました: ${error.message}`);
      }
      throw new Error("データベース操作に失敗しました");
    }
  });
};
