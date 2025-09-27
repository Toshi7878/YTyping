import { and, desc, eq } from "drizzle-orm";
import z from "zod";
import { MapLikes, Notifications, Results } from "@/server/drizzle/schema";
import { protectedProcedure } from "../trpc";
import type { MapListItem } from "./map-list";

export const notificationRouter = {
  hasUnread: protectedProcedure.query(async ({ ctx }) => {
    const isUnreadNotificationFound = await ctx.db.query.Notifications.findFirst({
      columns: { checked: true },
      where: and(eq(Notifications.visitedId, ctx.user.id), eq(Notifications.checked, false)),
    }).then((res) => res !== undefined);

    return isUnreadNotificationFound;
  }),
  getInfinite: protectedProcedure
    .input(z.object({ cursor: z.string().nullable().optional() }))
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const PAGE_SIZE = 20;

      const page = input.cursor ? Number(input.cursor) : 0;
      const offset = Number.isNaN(page) ? 0 : page * PAGE_SIZE;

      const notifications = await db.query.Notifications.findMany({
        where: eq(Notifications.visitedId, user.id),
        orderBy: desc(Notifications.createdAt),
        limit: PAGE_SIZE + 1,
        offset,
        with: {
          visitor: { columns: { id: true, name: true } },
          map: {
            columns: {
              creatorComment: false,
              category: false,
              createdAt: false,
              creatorId: false,
              playCount: false,
              tags: false,
            },
            with: {
              creator: { columns: { id: true, name: true } },
              difficulty: { columns: { romaKpmMedian: true, romaKpmMax: true } },
              mapLikes: {
                where: and(eq(MapLikes.userId, user.id)),
                columns: { hasLiked: true },
                limit: 1,
              },
              results: {
                where: and(eq(Results.userId, user.id)),
                columns: { rank: true },
                limit: 1,
              },
            },
          },
          visitedResult: { with: { status: { columns: { score: true } } } },
          visitorResult: { with: { status: { columns: { score: true } } } },
        },
      });

      const items = notifications.map(({ map: m, ...rest }) => ({
        created_at: rest.createdAt,
        action: rest.action,
        visitor: {
          id: rest.visitorId,
          name: rest.visitor?.name ?? null,
          score: rest.visitorResult?.status?.score ?? null,
        },
        myResult: {
          old_rank: rest.oldRank,
          score: rest.visitedResult?.status?.score ?? null,
        },
        map: {
          id: m.id,
          updatedAt: m.updatedAt,
          media: {
            videoId: m.videoId,
            previewTime: m.previewTime,
            thumbnailQuality: m.thumbnailQuality,
          },
          info: {
            title: m.title,
            artistName: m.artistName,
            source: m.musicSource,
            duration: m.duration,
          },
          creator: m.creator,
          difficulty: {
            romaKpmMedian: m.difficulty.romaKpmMedian,
            romaKpmMax: m.difficulty.romaKpmMax,
          },
          like: {
            count: m.likeCount,
            hasLiked: m.mapLikes?.[0]?.hasLiked ?? false,
          },
          ranking: {
            count: m.rankingCount,
            myRank: m.results?.[0]?.rank ?? null,
          },
        } satisfies MapListItem,
      }));

      let nextCursor: string | undefined;
      if (items.length > PAGE_SIZE) {
        items.pop();
        nextCursor = String(Number.isNaN(page) ? 1 : page + 1);
      }

      return { notifications: items, nextCursor };
    }),

  postUserNotificationRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    await db
      .update(Notifications)
      .set({ checked: true })
      .where(and(eq(Notifications.visitedId, user.id), eq(Notifications.checked, false)));
  }),
};
