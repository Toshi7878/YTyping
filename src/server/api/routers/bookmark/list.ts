import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { MapBookmarkListItems, MapBookmarkLists, Maps } from "@/server/drizzle/schema";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const bookmarkListRouter = {
  getForSession: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    return db
      .select({
        id: MapBookmarkLists.id,
        title: MapBookmarkLists.title,
      })
      .from(MapBookmarkLists)
      .leftJoin(MapBookmarkListItems, eq(MapBookmarkListItems.listId, MapBookmarkLists.id))
      .groupBy(MapBookmarkLists.id)
      .where(eq(MapBookmarkLists.userId, user.id));
  }),

  getByUserId: publicProcedure
    .input(z.object({ userId: z.number(), includeMapId: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;

      const firstMapByListSubquery = db
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

  create: protectedProcedure
    .input(z.object({ title: z.string().min(1), isPublic: z.boolean().default(false) }))
    .mutation(async ({ input, ctx }) => {
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

  update: protectedProcedure
    .input(z.object({ listId: z.number(), title: z.string().min(1), isPublic: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      return db
        .update(MapBookmarkLists)
        .set({
          title: input.title,
          isPublic: input.isPublic,
        })
        .where(and(eq(MapBookmarkLists.id, input.listId), eq(MapBookmarkLists.userId, user.id)));
    }),

  delete: protectedProcedure.input(z.object({ listId: z.number() })).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    return db
      .delete(MapBookmarkLists)
      .where(and(eq(MapBookmarkLists.id, input.listId), eq(MapBookmarkLists.userId, user.id)));
  }),
} satisfies TRPCRouterRecord;
