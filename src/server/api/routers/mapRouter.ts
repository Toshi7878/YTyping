import { MapData } from "@/app/type/ts/type";
import { supabase } from "@/lib/supabaseClient";
import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const mapRouter = {
  getMapInfo: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input }) => {
    const { mapId } = input;

    const session = await auth();
    const userId = session?.user ? Number(session?.user.id) : 0;

    const mapInfo = await prisma.maps.findUnique({
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
          where: { user_id: userId },
          select: { is_liked: true },
        },
        creator: {
          select: {
            name: true,
          },
        },
      },
    });

    return mapInfo;
  }),
  getCreatedVideoIdMapList: publicProcedure
    .input(z.object({ videoId: z.string().length(11) }))
    .query(async ({ input }) => {
      const { videoId } = input;
      const session = await auth();
      const userId = session ? Number(session.user.id) : 0;

      const mapList = await prisma.maps.findMany({
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
              user_id: userId,
            },
            select: {
              is_liked: true,
            },
          },
          results: {
            where: {
              user_id: userId,
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
      const timestamp = new Date().getTime(); // 一意のクエリパラメータを生成

      const { data, error } = await supabase.storage
        .from("map-data") // バケット名を指定
        .download(`public/${input.mapId}.json?timestamp=${timestamp}`);

      if (error) {
        console.error("Error downloading from Supabase:", error);
        throw error;
      }

      const jsonString = await data.text();
      const jsonData: MapData[] = JSON.parse(jsonString);

      return jsonData;
    } catch (error) {
      console.error("Error processing the downloaded file:", error);
      throw error;
    }
  }),
};
