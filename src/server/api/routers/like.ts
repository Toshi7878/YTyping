import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";
import { MapLikes, Maps } from "@/server/drizzle/schema";
import { protectedProcedure } from "../trpc";

export const likeRouter = {
  toggleLike: protectedProcedure
    .input(z.object({ mapId: z.number(), newState: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { mapId, newState } = input;

      const payload = await db.transaction(async (tx) => {
        await tx
          .insert(MapLikes)
          .values({ userId: user.id, mapId, hasLiked: true })
          .onConflictDoUpdate({ target: [MapLikes.userId, MapLikes.mapId], set: { hasLiked: newState } });

        const newLikeCount = await tx
          .select({ c: count() })
          .from(MapLikes)
          .where(and(eq(MapLikes.mapId, mapId), eq(MapLikes.hasLiked, true)))
          .then((rows) => rows[0]?.c ?? 0);

        await tx.update(Maps).set({ likeCount: newLikeCount }).where(eq(Maps.id, mapId));

        return { mapId, hasLiked: newState, likeCount: newLikeCount };
      });

      return payload;
    }),
} satisfies TRPCRouterRecord;
