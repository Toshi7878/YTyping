import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";
import { MapLikes, Maps, NotificationLikes, Notifications } from "@/server/drizzle/schema";
import { protectedProcedure } from "../../trpc";
import { generateNotificationId } from "../../utils/id";

export const mapLikeRouter = {
  toggleLike: protectedProcedure
    .input(z.object({ mapId: z.number(), newState: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { mapId, newState } = input;

      const payload = await db.transaction(async (tx) => {
        const isFirstLike = await tx.query.MapLikes.findFirst({
          where: and(eq(MapLikes.userId, user.id), eq(MapLikes.mapId, mapId)),
        }).then((res) => !res);

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

        if (isFirstLike) {
          const map = await tx.query.Maps.findFirst({
            where: eq(Maps.id, mapId),
            columns: { creatorId: true },
          });

          if (map && map.creatorId !== user.id) {
            const notificationId = generateNotificationId();

            await tx.insert(Notifications).values({
              id: notificationId,
              recipientId: map.creatorId,
              type: "LIKE",
            });

            await tx.insert(NotificationLikes).values({
              notificationId,
              likerId: user.id,
              mapId,
            });
          }
        }

        return { mapId, hasLiked: newState, likeCount: newLikeCount };
      });

      return payload;
    }),
} satisfies TRPCRouterRecord;
