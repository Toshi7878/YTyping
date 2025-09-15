import { MapDifficulties, MapLikes, Maps, Results, Users } from "@/server/drizzle/schema";
import { and, eq } from "drizzle-orm";
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
        const rows = await db
          .select({
            id: Maps.id,
            videoId: Maps.videoId,
            title: Maps.title,
            artistName: Maps.artistName,
            musicSource: Maps.musicSource,
            previewTime: Maps.previewTime,
            thumbnailQuality: Maps.thumbnailQuality,
            likeCount: Maps.likeCount,
            rankingCount: Maps.rankingCount,
            totalTime: MapDifficulties.totalTime,
            creator: {
              id: Users.id,
              name: Users.name,
            },
            difficulty: {
              romaKpmMedian: MapDifficulties.romaKpmMedian,
              romaKpmMax: MapDifficulties.romaKpmMax,
            },
            hasLiked: MapLikes.isLiked,
            myRank: Results.rank,
            updatedAt: Maps.updatedAt,
          })
          .from(Maps)
          .innerJoin(MapDifficulties, eq(MapDifficulties.mapId, Maps.id))
          .leftJoin(MapLikes, and(eq(MapLikes.mapId, Maps.id), eq(MapLikes.userId, user.id)))
          .leftJoin(Results, and(eq(Results.mapId, Maps.id), eq(Results.userId, user.id)))
          .innerJoin(Users, eq(Users.id, Maps.creatorId))
          .where(eq(Maps.id, activeUser.mapId));

        return { ...activeUser, map: rows[0] };
      } else {
        return { ...activeUser, map: null };
      }
    });

    const userList = await Promise.all(userListPromises);
    return userList;
  }),
};
