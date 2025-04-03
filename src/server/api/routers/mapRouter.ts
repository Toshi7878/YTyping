import { supabase } from "@/lib/supabaseClient";
import { MapLine } from "@/types/map";
import { z } from "@/validator/z";
import { TRPCError } from "@trpc/server";
import { publicProcedure } from "../trpc";

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
  getCreatedVideoIdMapList: publicProcedure
    .input(z.object({ videoId: z.string().length(11) }))
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { videoId } = input;

      const mapList = await db.maps.findMany({
        where: {
          video_id: videoId,
        },
        select: {
          id: true,
          title: true,
          artist_name: true,
          music_source: true,

          video_id: true,
          updated_at: true,
          preview_time: true,
          thumbnail_quality: true,
          like_count: true,
          ranking_count: true,
          difficulty: {
            select: {
              roma_kpm_median: true,
              roma_kpm_max: true,
              total_time: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          map_likes: {
            where: {
              user_id: user.id,
            },
            select: {
              is_liked: true,
            },
          },
          results: {
            where: {
              user_id: user.id,
            },
            select: {
              rank: true,
            },
          },
        },
        orderBy: {
          id: "desc",
        },
      });

      return mapList;
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
      const jsonData: MapLine[] = JSON.parse(jsonString);

      return jsonData;
    } catch (error) {
      console.error("Error processing the downloaded file:", error);
      throw error;
    }
  }),
};
