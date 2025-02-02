import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userStatusSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    onlineAt: z.coerce.date(),
    state: z.string(),
    mapId: z.number().nullable(),
  })
);

export const activeUserRouter = {
  getUserPlayingMaps: publicProcedure.input(userStatusSchema).query(async ({ input }) => {
    const session = await auth();
    const userId = session?.user ? Number(session?.user.id) : 0;

    const userListPromises = input.map(async (activeUser) => {
      if (activeUser.state === "type" && activeUser.mapId) {
        const mapInfo = await prisma.maps.findUnique({
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
