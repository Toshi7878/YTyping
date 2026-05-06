import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gt, inArray, sql } from "drizzle-orm";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
import {
  mapBookmarkListItems,
  mapBookmarkLists,
  maps,
  notificationMapBookmarks,
  notifications,
  users,
} from "@/server/drizzle/schema";
import { CreateMapBookmarkListApiSchema, UpdateMapBookmarkListApiSchema } from "@/validator/map/bookmark";
import { protectedProcedure, publicProcedure } from "../../../trpc";

export const mapBookmarkListsRouter = {
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const firstMapByListSubquery = getFirstMapByListSubquery(db);

    return db
      .select({
        id: mapBookmarkLists.id,
        title: mapBookmarkLists.title,
        count: sql<number>`count(${mapBookmarkListItems.mapId})`.mapWith(Number),
        firstMapVideoId: sql<string | null>`max(${firstMapByListSubquery.videoId})`,
        updatedAt: mapBookmarkLists.updatedAt,
        userName: users.name,
        userId: mapBookmarkLists.userId,
      })
      .from(mapBookmarkLists)
      .innerJoin(users, eq(users.id, mapBookmarkLists.userId))
      .leftJoin(mapBookmarkListItems, eq(mapBookmarkListItems.listId, mapBookmarkLists.id))
      .leftJoin(
        firstMapByListSubquery,
        and(eq(firstMapByListSubquery.listId, mapBookmarkLists.id), eq(firstMapByListSubquery.rn, 1)),
      )
      .where(eq(mapBookmarkLists.isPublic, true))
      .groupBy(mapBookmarkLists.id, users.name)
      .having(({ count }) => gt(count, 1))
      .orderBy(desc(mapBookmarkLists.updatedAt));
  }),

  getForSession: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    return db
      .select({ id: mapBookmarkLists.id, title: mapBookmarkLists.title })
      .from(mapBookmarkLists)
      .leftJoin(mapBookmarkListItems, eq(mapBookmarkListItems.listId, mapBookmarkLists.id))
      .groupBy(mapBookmarkLists.id)
      .where(eq(mapBookmarkLists.userId, session.user.id));
  }),

  getByUserId: publicProcedure
    .input(z.object({ userId: z.number(), includeMapId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const { db, session } = ctx;

      const firstMapByListSubquery = getFirstMapByListSubquery(db);

      return db
        .select({
          id: mapBookmarkLists.id,
          title: mapBookmarkLists.title,
          isPublic: mapBookmarkLists.isPublic,
          count: sql<number>`count(${mapBookmarkListItems.mapId})`.mapWith(Number),
          hasMap: input.includeMapId
            ? sql<boolean>`coalesce(bool_or(${mapBookmarkListItems.mapId} = ${input.includeMapId}), false)`.mapWith(
                Boolean,
              )
            : sql<boolean>`false`.mapWith(Boolean),
          firstMapVideoId: sql<string | null>`max(${firstMapByListSubquery.videoId})`,
          updatedAt: mapBookmarkLists.updatedAt,
        })
        .from(mapBookmarkLists)
        .leftJoin(mapBookmarkListItems, eq(mapBookmarkListItems.listId, mapBookmarkLists.id))
        .leftJoin(
          firstMapByListSubquery,
          and(eq(firstMapByListSubquery.listId, mapBookmarkLists.id), eq(firstMapByListSubquery.rn, 1)),
        )
        .where(
          and(
            eq(mapBookmarkLists.userId, input.userId),
            input.userId !== session?.user.id ? eq(mapBookmarkLists.isPublic, true) : undefined,
          ),
        )
        .groupBy(mapBookmarkLists.id)
        .orderBy(desc(mapBookmarkLists.updatedAt));
    }),

  getCount: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;

    const total = await db
      .select({ count: count() })
      .from(mapBookmarkLists)
      .where(
        and(
          eq(mapBookmarkLists.userId, input.userId),
          input.userId !== session?.user.id ? eq(mapBookmarkLists.isPublic, true) : undefined,
        ),
      );

    return total[0]?.count ?? 0;
  }),

  create: protectedProcedure.input(CreateMapBookmarkListApiSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    const listCount = await db
      .select({ count: count() })
      .from(mapBookmarkLists)
      .where(eq(mapBookmarkLists.userId, session.user.id))
      .then((rows) => rows[0]?.count ?? 0);

    if (listCount >= 15) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "ブックマークリストは最大15件まで作成できます",
      });
    }

    return db.insert(mapBookmarkLists).values({
      userId: session.user.id,
      title: input.title,
      isPublic: input.isPublic,
    });
  }),

  update: protectedProcedure.input(UpdateMapBookmarkListApiSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;
    return db
      .update(mapBookmarkLists)
      .set({
        title: input.title,
        isPublic: input.isPublic,
      })
      .where(and(eq(mapBookmarkLists.id, input.id), eq(mapBookmarkLists.userId, session.user.id)));
  }),

  delete: protectedProcedure.input(z.object({ listId: z.number() })).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    return db.transaction(async (tx) => {
      // list削除の cascade で notification_map_bookmarks 側は消えるが、notifications は残り得る。
      // 先に紐づく notifications を消して、孤児通知を作らないようにする。
      const relatedNotificationIds = await tx
        .select({ id: notificationMapBookmarks.notificationId })
        .from(notificationMapBookmarks)
        .innerJoin(mapBookmarkLists, eq(mapBookmarkLists.id, notificationMapBookmarks.listId))
        .where(and(eq(notificationMapBookmarks.listId, input.listId), eq(mapBookmarkLists.userId, session.user.id)));

      if (relatedNotificationIds.length > 0) {
        await tx.delete(notifications).where(
          inArray(
            notifications.id,
            relatedNotificationIds.map((r) => r.id),
          ),
        );
      }

      return await tx
        .delete(mapBookmarkLists)
        .where(and(eq(mapBookmarkLists.id, input.listId), eq(mapBookmarkLists.userId, session.user.id)));
    });
  }),
} satisfies TRPCRouterRecord;

const getFirstMapByListSubquery = (db: DBType) => {
  return db
    .select({
      listId: mapBookmarkListItems.listId,
      videoId: maps.videoId,
      rn: sql<number>`row_number() over (
    partition by ${mapBookmarkListItems.listId}
    order by ${mapBookmarkListItems.createdAt} asc, ${mapBookmarkListItems.mapId} asc
  )`.as("rn"),
    })
    .from(mapBookmarkListItems)
    .innerJoin(maps, eq(maps.id, mapBookmarkListItems.mapId))
    .as("first_map_by_list");
};
