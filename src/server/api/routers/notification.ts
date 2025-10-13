import type { TRPCRouterRecord } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";
import { MapLikes, Notifications, Results } from "@/server/drizzle/schema";
import { protectedProcedure } from "../trpc";
import { createCursorPager } from "../utils/cursor-pager";
import type { MapListItem } from "./map-list";

export const notificationRouter = {
  hasUnread: protectedProcedure.query(async ({ ctx }) => {
    const isUnreadNotificationFound = await ctx.db.query.Notifications.findFirst({
      columns: { checked: true },
      where: and(eq(Notifications.recipientId, ctx.user.id), eq(Notifications.checked, false)),
    }).then((res) => res !== undefined);

    return isUnreadNotificationFound;
  }),
  getInfinite: protectedProcedure
    .input(z.object({ cursor: z.string().nullable().optional() }))
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const PAGE_SIZE = 20;
      const pager = createCursorPager(PAGE_SIZE);

      const { page, offset } = pager.parse(input.cursor);

      const notifications = await db.query.Notifications.findMany({
        columns: {
          action: true,
          updatedAt: true,
        },
        with: {
          overTake: {
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
                    columns: { rank: true, updatedAt: true },
                    limit: 1,
                  },
                },
              },
              visitedResult: { with: { status: { columns: { score: true } } } },
              visitorResult: { with: { status: { columns: { score: true } } } },
            },
          },
        },
        where: eq(Notifications.recipientId, user.id),
        orderBy: desc(Notifications.updatedAt),
        limit: PAGE_SIZE + 1,
        offset,
      });

      const items = notifications
        .map((notification) => {
          if (notification.action === "OVER_TAKE" && notification.overTake) {
            const { overTake } = notification;
            return {
              action: "OVER_TAKE" as const,
              updatedAt: notification.updatedAt,
              visitor: {
                id: overTake.visitorId,
                name: overTake.visitor?.name ?? "名無し",
                score: overTake.visitorResult.status.score,
              },
              myResult: {
                prevRank: overTake.prevRank,
                score: overTake.visitedResult.status.score,
              },
              map: {
                id: overTake.map.id,
                updatedAt: overTake.map.updatedAt,
                media: {
                  videoId: overTake.map.videoId,
                  previewTime: overTake.map.previewTime,
                  thumbnailQuality: overTake.map.thumbnailQuality,
                },
                info: {
                  title: overTake.map.title,
                  artistName: overTake.map.artistName,
                  source: overTake.map.musicSource,
                  duration: overTake.map.duration,
                },
                creator: overTake.map.creator,
                difficulty: {
                  romaKpmMedian: overTake.map.difficulty.romaKpmMedian,
                  romaKpmMax: overTake.map.difficulty.romaKpmMax,
                },
                like: {
                  count: overTake.map.likeCount,
                  hasLiked: overTake.map.mapLikes?.[0]?.hasLiked ?? false,
                },
                ranking: {
                  count: overTake.map.rankingCount,
                  myRank: overTake.map.results?.[0]?.rank ?? null,
                  myRankUpdatedAt: overTake.map.results?.[0]?.updatedAt ?? null,
                },
              } satisfies MapListItem,
            };
          }

          // 将来の拡張: LIKE通知
          // if (notification.action === "LIKE" && notification.like) {
          //   return {
          //     action: "LIKE" as const,
          //     createdAt: notification.createdAt,
          //     checked: notification.checked,
          //     ...
          //   };
          // }

          // フォールバック（通常は到達しない）
          throw new Error(`Unknown notification action: ${notification.action}`);
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      return pager.paginate(items, page);
    }),

  postUserNotificationRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    await db
      .update(Notifications)
      .set({ checked: true })
      .where(and(eq(Notifications.recipientId, user.id), eq(Notifications.checked, false)));
  }),
} satisfies TRPCRouterRecord;
