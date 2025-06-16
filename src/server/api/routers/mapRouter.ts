import { supabase } from "@/lib/supabaseClient";
import { prisma } from "@/server/db";
import { MapLine } from "@/types/map";
import { mapDataSchema } from "@/validator/mapDataSchema";
import { mapInfoApiSchema } from "@/validator/schema";
import { z } from "@/validator/z";
import { TRPCError } from "@trpc/server";
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

    const mapInfo = await db.maps.findUnique({
      where: { id: mapId },
      select: {
        title: true,
        artist_name: true,
        music_source: true,
        creator_comment: true,
        creator_id: true,
        tags: true,
        video_id: true,
        preview_time: true,
        created_at: true,
        updated_at: true,
        thumbnail_quality: true,
        map_likes: {
          where: { user_id: user.id },
          select: { is_liked: true },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!mapInfo) {
      throw new TRPCError({
        code: "BAD_REQUEST",
      });
    }

    const isLiked = !!mapInfo?.map_likes?.[0]?.is_liked;
    const creatorName = mapInfo?.creator.name;

    // map_likesプロパティを除外して返す
    const { map_likes, creator, ...restMapInfo } = mapInfo;

    return { ...restMapInfo, isLiked, creatorName };
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

      const hasUpsertPermission = await prisma.maps
        .findUnique({
          where: { id: mapId === "new" ? undefined : Number(mapId) },
          select: {
            creator_id: true,
          },
        })
        .then((res) => {
          return mapId === "new" || res?.creator_id === userId || userRole === "ADMIN";
        });

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
  return await prisma.$transaction(async (tx) => {
    try {
      const mapIdNumber = mapId === "new" ? undefined : Number(mapId);
      const upsertedMap = await tx.maps.upsert({
        where: {
          id: mapIdNumber,
        },
        update: {
          ...mapInfo,
          ...(isMapDataEdited && { updated_at: new Date() }),
        },
        create: {
          ...mapInfo,
          creator_id: userId,
        },
      });

      const newMapId = upsertedMap.id;

      await tx.map_difficulties.upsert({
        where: {
          map_id: newMapId,
        },
        update: {
          ...mapDifficulty,
        },
        create: {
          map_id: newMapId,
          ...mapDifficulty,
        },
      });

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
      console.error("Prisma Error:", error);
      if (error instanceof Error) {
        throw new Error(`データベース操作に失敗しました: ${error.message}`);
      }
      throw new Error("データベース操作に失敗しました");
    }
  });
};
