import z from "zod";
import { publicProcedure } from "../trpc";

const userStatusSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    onlineAt: z.coerce.date(),
    state: z.string(),
    mapId: z.number().nullable(),
  }),
);

export const activeUserRouter = {
  getUserPlayingMaps: publicProcedure.input(userStatusSchema).query(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const userListPromises = input.map(async (activeUser) => {
      if (activeUser.state === "type" && activeUser.mapId) {
        const mapInfo = await db.maps.findUnique({
          where: { id: activeUser.mapId },
          select: {
            id: true,
            title: true,
            artist_name: true,
            music_source: true,
            video_id: true,
            creator_id: true,
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
            creator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return { ...activeUser, map: mapInfo };
      } else {
        return { ...activeUser, map: null };
      }
    });

    const userList = await Promise.all(userListPromises);
    return userList;
  }),
};
