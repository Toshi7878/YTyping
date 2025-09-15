import { supabase } from "@/lib/supabaseClient";
import { db as drizzleDb, schema } from "@/server/drizzle/client";
import { sql, and, eq } from "drizzle-orm";
import { MapLine } from "@/types/map";
import { mapDataSchema } from "@/validator/mapDataSchema";
import { mapInfoApiSchema } from "@/validator/schema";
import { TRPCError } from "@trpc/server";
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

    const rows = (await db.execute(sql`
      SELECT
        m."title",
        m."artist_name",
        m."music_source",
        m."creator_comment",
        m."creator_id",
        m."tags",
        m."video_id",
        m."preview_time",
        m."created_at",
        m."updated_at",
        m."thumbnail_quality",
        EXISTS (
          SELECT 1 FROM map_likes ml WHERE ml."map_id" = m."id" AND ml."user_id" = ${user.id} AND ml."is_liked" = true
        ) as is_liked,
        u."name" as creator_name
      FROM maps m
      JOIN users u ON u."id" = m."creator_id"
      WHERE m."id" = ${mapId}
      LIMIT 1
    `)).rows as any[];

    const mapInfo = rows[0];

    if (!mapInfo) {
      throw new TRPCError({
        code: "BAD_REQUEST",
      });
    }

    const { is_liked, creator_name, ...restMapInfo } = mapInfo;

    return { ...restMapInfo, isLiked: !!is_liked, creatorName: creator_name };
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
              .select({ creator_id: schema.maps.creatorId })
              .from(schema.maps)
              .where(eq(schema.maps.id, Number(mapId)))
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
        videoId: mapInfo.video_id,
        title: mapInfo.title,
        artistName: mapInfo.artist_name,
        musicSource: mapInfo.music_source,
        creatorComment: mapInfo.creator_comment,
        tags: mapInfo.tags,
        creatorId: userId,
        previewTime: Number(mapInfo.preview_time),
        thumbnailQuality: mapInfo.thumbnail_quality,
      } as const;

      const inserted = await tx
        .insert(schema.maps)
        .values(mapValues)
        .onConflictDoUpdate({
          target: [schema.maps.id],
          set: { ...mapValues, ...(isMapDataEdited ? { updatedAt: new Date() } : {}) },
        })
        .returning({ id: schema.maps.id });

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
        .insert(schema.mapDifficulties)
        .values(diffValues)
        .onConflictDoUpdate({ target: [schema.mapDifficulties.mapId], set: { ...diffValues } });

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
