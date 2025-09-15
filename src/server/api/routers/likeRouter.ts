import { schema } from "@/server/drizzle/client";
import { and, count, eq } from "drizzle-orm";
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

      const payload = await db.transaction(async (tx) => {
        await tx
          .insert(schema.MapLikes)
          .values({ userId: user.id, mapId, isLiked: true })
          .onConflictDoUpdate({ target: [schema.MapLikes.userId, schema.MapLikes.mapId], set: { isLiked: likeValue } });

        const likeCountRows = await tx
          .select({ c: count() })
          .from(schema.MapLikes)
          .where(and(eq(schema.MapLikes.mapId, mapId), eq(schema.MapLikes.isLiked, true)));
        const newLikeCount = likeCountRows[0]?.c ?? 0;

        await tx.update(schema.Maps).set({ likeCount: newLikeCount }).where(eq(schema.Maps.id, mapId));

        return { mapId, isLiked: likeValue, likeCount: newLikeCount };
      });

      return payload;
    }),
};
