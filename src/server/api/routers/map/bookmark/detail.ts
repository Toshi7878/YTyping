import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import z from "zod";
import {
  MapBookmarkListItems,
  MapBookmarkLists,
  Maps,
  NotificationMapBookmarks,
  Notifications,
} from "@/server/drizzle/schema";
import { protectedProcedure } from "../../../trpc";
import { generateNotificationId } from "../../../utils/id";

export const mapBookmarkDetailRouter = {
  add: protectedProcedure
    .input(z.object({ listId: z.number(), mapId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;

      const list = await db.query.MapBookmarkLists.findFirst({
        where: and(eq(MapBookmarkLists.id, input.listId), eq(MapBookmarkLists.userId, user.id)),
      });
      if (!list) throw new Error("List not found");

      const existing = await db.query.MapBookmarkListItems.findFirst({
        where: and(eq(MapBookmarkListItems.listId, input.listId), eq(MapBookmarkListItems.mapId, input.mapId)),
      });

      if (!existing) {
        await db.insert(MapBookmarkListItems).values({ listId: input.listId, mapId: input.mapId });

        const map = await db.query.Maps.findFirst({
          columns: { creatorId: true },
          where: eq(Maps.id, input.mapId),
        });

        if (map && map.creatorId !== user.id) {
          const existingNotification = await db.query.NotificationMapBookmarks.findFirst({
            where: and(
              eq(NotificationMapBookmarks.bookmarkerId, user.id),
              eq(NotificationMapBookmarks.listId, input.listId),
              eq(NotificationMapBookmarks.mapId, input.mapId),
            ),
          });

          if (!existingNotification) {
            const notificationId = generateNotificationId();
            await db.transaction(async (tx) => {
              await tx.insert(Notifications).values({
                id: notificationId,
                recipientId: map.creatorId,
                type: "MAP_BOOKMARK",
              });
              await tx.insert(NotificationMapBookmarks).values({
                notificationId,
                bookmarkerId: user.id,
                listId: input.listId,
                mapId: input.mapId,
              });
            });
          }
        }
      }

      return { action: "added" as const };
    }),

  remove: protectedProcedure
    .input(z.object({ listId: z.number(), mapId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;

      const list = await db.query.MapBookmarkLists.findFirst({
        where: and(eq(MapBookmarkLists.id, input.listId), eq(MapBookmarkLists.userId, user.id)),
      });
      if (!list) throw new Error("List not found");

      await db
        .delete(MapBookmarkListItems)
        .where(and(eq(MapBookmarkListItems.listId, input.listId), eq(MapBookmarkListItems.mapId, input.mapId)));

      return { action: "removed" as const };
    }),
} satisfies TRPCRouterRecord;
