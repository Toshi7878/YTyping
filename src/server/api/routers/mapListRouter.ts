import { z } from "@/validator/z";
import { protectedProcedure } from "../trpc";

export const mapListRouter = {
  getByVideoId: protectedProcedure.input(z.object({ videoId: z.string().length(11) })).query(async ({ input, ctx }) => {
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
};
