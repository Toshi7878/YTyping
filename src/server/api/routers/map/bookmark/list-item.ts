import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq, exists, type SQLWrapper, sql } from "drizzle-orm";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
import {
  mapBookmarkListItems,
  mapBookmarkLists,
  maps,
  notificationMapBookmarks,
  notifications,
} from "@/server/drizzle/schema";
import { type ProtectedCtx, protectedProcedure } from "../../../trpc";
import { generateNotificationId } from "../../notification";

export const mapBookmarkListItemRouter = {
  add: protectedProcedure
    .input(z.object({ listId: z.number(), mapId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;

      const list = await db.query.mapBookmarkLists.findFirst({
        where: { id: input.listId, userId: session.user.id },
      });
      if (!list) throw new Error("List not found");

      const existing = await db.query.mapBookmarkListItems.findFirst({
        where: { listId: input.listId, mapId: input.mapId },
      });

      if (!existing) {
        await db.insert(mapBookmarkListItems).values({ listId: input.listId, mapId: input.mapId });

        const map = await db.query.maps.findFirst({
          columns: { creatorId: true },
          where: { id: input.mapId },
        });

        if (map && map.creatorId !== session.user.id) {
          const existingNotification = await db.query.notificationMapBookmarks.findFirst({
            where: {
              bookmarkerId: session.user.id,
              listId: input.listId,
              mapId: input.mapId,
            },
          });

          if (!existingNotification && list.isPublic) {
            const notificationId = generateNotificationId();
            await db.transaction(async (tx) => {
              await tx.insert(notifications).values({
                id: notificationId,
                recipientId: map.creatorId,
                type: "MAP_BOOKMARK",
              });
              await tx.insert(notificationMapBookmarks).values({
                notificationId,
                bookmarkerId: session.user.id,
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
      const { db, session } = ctx;

      const list = await db.query.mapBookmarkLists.findFirst({
        where: { id: input.listId, userId: session.user.id },
      });
      if (!list) throw new Error("List not found");

      await db
        .delete(mapBookmarkListItems)
        .where(and(eq(mapBookmarkListItems.listId, input.listId), eq(mapBookmarkListItems.mapId, input.mapId)));

      return { action: "removed" as const };
    }),
} satisfies TRPCRouterRecord;

export const bookmarkedMapExists = (
  db: DBType,
  session: ProtectedCtx["session"],
  mapIdColumn: SQLWrapper = maps.id,
) => {
  return exists(
    db
      .select({ one: sql`1` })
      .from(mapBookmarkListItems)
      .innerJoin(mapBookmarkLists, eq(mapBookmarkLists.id, mapBookmarkListItems.listId))
      .where(and(eq(mapBookmarkListItems.mapId, mapIdColumn), eq(mapBookmarkLists.userId, session.user.id))),
  ).mapWith(Boolean);
};
