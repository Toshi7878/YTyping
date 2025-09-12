import z from "zod";
import { protectedProcedure } from "../trpc";

export const likeRouter = {
  setLike: protectedProcedure
    .input(
      z.object({
        mapId: z.number(),
        likeValue: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { mapId, likeValue } = input;

      const payload = await db.$transaction(async (tx) => {
        await tx.map_likes.upsert({
          where: {
            user_id_map_id: {
              user_id: user.id,
              map_id: mapId,
            },
          },
          update: {
            is_liked: likeValue,
          },
          create: {
            user_id: user.id,
            map_id: mapId,
            is_liked: true,
          },
        });

        const newLikeCount = await tx.map_likes.count({
          where: {
            map_id: mapId,
            is_liked: true,
          },
        });

        await tx.maps.update({
          where: { id: mapId },
          data: { like_count: newLikeCount },
        });

        return { mapId, isLiked: likeValue, likeCount: newLikeCount };
      });

      return payload;
    }),
};
