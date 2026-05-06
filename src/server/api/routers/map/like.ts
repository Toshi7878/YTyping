import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";
import { mapLikes, maps, notificationLikes, notifications } from "@/server/drizzle/schema";
import { protectedProcedure } from "../../trpc";
import { generateNotificationId } from "../notification";

export const mapLikeRouter = {
  toggle: protectedProcedure
    .input(z.object({ mapId: z.number(), newState: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;
      const { mapId, newState } = input;

      const payload = await db.transaction(async (tx) => {
        const isFirstLike = await tx.query.mapLikes
          .findFirst({ where: { userId: session.user.id, mapId } })
          .then((res) => !res);

        await tx
          .insert(mapLikes)
          .values({ userId: session.user.id, mapId, hasLiked: true })
          .onConflictDoUpdate({ target: [mapLikes.userId, mapLikes.mapId], set: { hasLiked: newState } });

        const newLikeCount = await tx
          .select({ c: count() })
          .from(mapLikes)
          .where(and(eq(mapLikes.mapId, mapId), eq(mapLikes.hasLiked, true)))
          .then((rows) => rows[0]?.c ?? 0);

        await tx.update(maps).set({ likeCount: newLikeCount }).where(eq(maps.id, mapId));

        if (isFirstLike) {
          const map = await tx.query.maps.findFirst({
            where: { id: mapId },
            columns: { creatorId: true },
          });

          if (map && map.creatorId !== session.user.id) {
            const notificationId = generateNotificationId();

            await tx.insert(notifications).values({
              id: notificationId,
              recipientId: map.creatorId,
              type: "LIKE",
            });

            await tx.insert(notificationLikes).values({
              notificationId,
              likerId: session.user.id,
              mapId,
            });
          }
        }

        return { mapId, hasLiked: newState, likeCount: newLikeCount };
      });

      return payload;
    }),
} satisfies TRPCRouterRecord;
