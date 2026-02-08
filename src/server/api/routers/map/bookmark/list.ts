import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, gt, inArray, sql } from "drizzle-orm";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
import {
  MapBookmarkListItems,
  MapBookmarkLists,
  Maps,
  NotificationMapBookmarks,
  Notifications,
  Users,
} from "@/server/drizzle/schema";
import { CreateMapBookmarkListApiSchema, UpdateMapBookmarkListApiSchema } from "@/validator/bookmark";
import { protectedProcedure, publicProcedure } from "../../../trpc";

export const mapBookmarkListRouter = {
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const firstMapByListSubquery = getFirstMapByListSubquery(db);

    return db
      .select({
        id: MapBookmarkLists.id,
        title: MapBookmarkLists.title,
        count: sql<number>`count(${MapBookmarkListItems.mapId})`.mapWith(Number),
        firstMapVideoId: sql<string | null>`max(${firstMapByListSubquery.videoId})`,
        updatedAt: MapBookmarkLists.updatedAt,
        userName: Users.name,
        userId: MapBookmarkLists.userId,
      })
      .from(MapBookmarkLists)
      .innerJoin(Users, eq(Users.id, MapBookmarkLists.userId))
      .leftJoin(MapBookmarkListItems, eq(MapBookmarkListItems.listId, MapBookmarkLists.id))
      .leftJoin(
        firstMapByListSubquery,
        and(eq(firstMapByListSubquery.listId, MapBookmarkLists.id), eq(firstMapByListSubquery.rn, 1)),
      )
      .where(eq(MapBookmarkLists.isPublic, true))
      .groupBy(MapBookmarkLists.id, Users.name)
      .having(({ count }) => gt(count, 1))
      .orderBy(desc(MapBookmarkLists.updatedAt));
  }),

  getForSession: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    return db
      .select({ id: MapBookmarkLists.id, title: MapBookmarkLists.title })
      .from(MapBookmarkLists)
      .leftJoin(MapBookmarkListItems, eq(MapBookmarkListItems.listId, MapBookmarkLists.id))
      .groupBy(MapBookmarkLists.id)
      .where(eq(MapBookmarkLists.userId, user.id));
  }),

  getByUserId: publicProcedure
    .input(z.object({ userId: z.number(), includeMapId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;

      const firstMapByListSubquery = getFirstMapByListSubquery(db);

      return db
        .select({
          id: MapBookmarkLists.id,
          title: MapBookmarkLists.title,
          isPublic: MapBookmarkLists.isPublic,
          count: sql<number>`count(${MapBookmarkListItems.mapId})`.mapWith(Number),
          hasMap: input.includeMapId
            ? sql<boolean>`coalesce(bool_or(${MapBookmarkListItems.mapId} = ${input.includeMapId}), false)`.mapWith(
                Boolean,
              )
            : sql<boolean>`false`.mapWith(Boolean),
          firstMapVideoId: sql<string | null>`max(${firstMapByListSubquery.videoId})`,
          updatedAt: MapBookmarkLists.updatedAt,
        })
        .from(MapBookmarkLists)
        .leftJoin(MapBookmarkListItems, eq(MapBookmarkListItems.listId, MapBookmarkLists.id))
        .leftJoin(
          firstMapByListSubquery,
          and(eq(firstMapByListSubquery.listId, MapBookmarkLists.id), eq(firstMapByListSubquery.rn, 1)),
        )
        .where(
          and(
            eq(MapBookmarkLists.userId, input.userId),
            input.userId !== user?.id ? eq(MapBookmarkLists.isPublic, true) : undefined,
          ),
        )
        .groupBy(MapBookmarkLists.id)
        .orderBy(desc(MapBookmarkLists.updatedAt));
    }),

  getCount: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const total = await db
      .select({ count: count() })
      .from(MapBookmarkLists)
      .where(
        and(
          eq(MapBookmarkLists.userId, input.userId),
          input.userId !== user?.id ? eq(MapBookmarkLists.isPublic, true) : undefined,
        ),
      );

    return total[0]?.count ?? 0;
  }),

  create: protectedProcedure.input(CreateMapBookmarkListApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const listCount = await db
      .select({ count: count() })
      .from(MapBookmarkLists)
      .where(eq(MapBookmarkLists.userId, user.id))
      .then((rows) => rows[0]?.count ?? 0);

    if (listCount >= 15) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "ブックマークリストは最大15件まで作成できます",
      });
    }

    return db.insert(MapBookmarkLists).values({
      userId: user.id,
      title: input.title,
      isPublic: input.isPublic,
    });
  }),

  update: protectedProcedure.input(UpdateMapBookmarkListApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    return db
      .update(MapBookmarkLists)
      .set({
        title: input.title,
        isPublic: input.isPublic,
      })
      .where(and(eq(MapBookmarkLists.id, input.id), eq(MapBookmarkLists.userId, user.id)));
  }),

  delete: protectedProcedure.input(z.object({ listId: z.number() })).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    return db.transaction(async (tx) => {
      // list削除の cascade で notification_map_bookmarks 側は消えるが、notifications は残り得る。
      // 先に紐づく notifications を消して、孤児通知を作らないようにする。
      const relatedNotificationIds = await tx
        .select({ id: NotificationMapBookmarks.notificationId })
        .from(NotificationMapBookmarks)
        .innerJoin(MapBookmarkLists, eq(MapBookmarkLists.id, NotificationMapBookmarks.listId))
        .where(and(eq(NotificationMapBookmarks.listId, input.listId), eq(MapBookmarkLists.userId, user.id)));

      if (relatedNotificationIds.length > 0) {
        await tx.delete(Notifications).where(
          inArray(
            Notifications.id,
            relatedNotificationIds.map((r) => r.id),
          ),
        );
      }

      return await tx
        .delete(MapBookmarkLists)
        .where(and(eq(MapBookmarkLists.id, input.listId), eq(MapBookmarkLists.userId, user.id)));
    });
  }),
} satisfies TRPCRouterRecord;

const getFirstMapByListSubquery = (db: DBType) => {
  return db
    .select({
      listId: MapBookmarkListItems.listId,
      videoId: Maps.videoId,
      rn: sql<number>`row_number() over (
    partition by ${MapBookmarkListItems.listId}
    order by ${MapBookmarkListItems.createdAt} asc, ${MapBookmarkListItems.mapId} asc
  )`.as("rn"),
    })
    .from(MapBookmarkListItems)
    .innerJoin(Maps, eq(Maps.id, MapBookmarkListItems.mapId))
    .as("first_map_by_list");
};
