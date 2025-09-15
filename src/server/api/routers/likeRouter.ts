import z from "zod";
import { and, count, eq } from "drizzle-orm";
import { schema } from "@/server/drizzle/client";
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

      const payload = await db.transaction(async (tx) => {
        await tx
          .insert(schema.mapLikes)
          .values({ userId: user.id, mapId, isLiked: true })
          .onConflictDoUpdate({ target: [schema.mapLikes.userId, schema.mapLikes.mapId], set: { isLiked: likeValue } });

        const likeCountRows = await tx
          .select({ c: count() })
          .from(schema.mapLikes)
          .where(and(eq(schema.mapLikes.mapId, mapId), eq(schema.mapLikes.isLiked, true)));
        const newLikeCount = likeCountRows[0]?.c ?? 0;

        await tx.update(schema.maps).set({ likeCount: newLikeCount }).where(eq(schema.maps.id, mapId));

        return { mapId, isLiked: likeValue, likeCount: newLikeCount };
      });

      return payload;
    }),
};
