import type { TRPCRouterRecord } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";
import { MapLikes, Notifications, Results } from "@/server/drizzle/schema";
import { protectedProcedure } from "../trpc";
import { createPagination } from "../utils/pagination";
import type { MapListItem } from "./map/list";

export const notificationRouter = {
  hasUnread: protectedProcedure.query(async ({ ctx }) => {
    const isUnreadNotificationFound = await ctx.db.query.Notifications.findFirst({
      columns: { checked: true },
      where: and(eq(Notifications.recipientId, ctx.user.id), eq(Notifications.checked, false)),
    }).then((res) => res !== undefined);

    return isUnreadNotificationFound;
  }),
  getInfinite: protectedProcedure.input(z.object({ cursor: z.number().optional() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const PAGE_SIZE = 20;
    const { limit, offset, buildPageResult } = createPagination(input?.cursor, PAGE_SIZE);

    const mapQuery = {
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
    } as const;

    const notifications = await db.query.Notifications.findMany({
      columns: {
        id: true,
        type: true,
        updatedAt: true,
      },
      with: {
        overTake: {
          with: {
            visitor: { columns: { id: true, name: true } },
            map: mapQuery,
            visitedResult: { with: { status: { columns: { score: true } } } },
            visitorResult: { with: { status: { columns: { score: true } } } },
          },
        },
        like: {
          columns: {},
          with: {
            liker: { columns: { id: true, name: true } },
            map: mapQuery,
          },
        },
        clap: {
          columns: {},
          with: {
            clapper: { columns: { id: true, name: true } },
            result: {
              with: {
                map: mapQuery,
                status: {
                  columns: {
                    minPlaySpeed: true,
                  },
                },
              },
            },
          },
        },
      },
      where: eq(Notifications.recipientId, user.id),
      orderBy: desc(Notifications.updatedAt),
      limit,
      offset,
    });

    const toMapListItem = (map: (typeof notifications)[number]["overTake"]["map"], previewSpeed?: number) => {
      return {
        id: map.id,
        updatedAt: map.updatedAt,
        media: {
          videoId: map.videoId,
          previewTime: map.previewTime,
          thumbnailQuality: map.thumbnailQuality,
          previewSpeed,
        },
        info: { title: map.title, artistName: map.artistName, source: map.musicSource, duration: map.duration },
        creator: { id: map.creator.id, name: map.creator.name },
        difficulty: { romaKpmMedian: map.difficulty.romaKpmMedian, romaKpmMax: map.difficulty.romaKpmMax },
        like: { count: map.likeCount, hasLiked: map.mapLikes?.[0]?.hasLiked ?? false },
        ranking: {
          count: map.rankingCount,
          myRank: map.results?.[0]?.rank ?? null,
          myRankUpdatedAt: map.results?.[0]?.updatedAt ?? null,
        },
      } satisfies MapListItem;
    };

    const items = notifications
      .map((notification) => {
        if (notification.type === "OVER_TAKE" && notification.overTake) {
          const { overTake } = notification;
          return {
            id: notification.id,
            type: notification.type,
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
            map: toMapListItem(overTake.map),
          };
        }

        if (notification.type === "LIKE" && notification.like) {
          const { like } = notification;

          return {
            id: notification.id,
            type: notification.type,
            updatedAt: notification.updatedAt,
            liker: like.liker,
            map: toMapListItem(like.map),
          };
        }
        if (notification.type === "CLAP" && notification.clap) {
          const { clap } = notification;

          return {
            id: notification.id,
            type: notification.type,
            updatedAt: notification.updatedAt,
            clapper: clap.clapper,
            map: toMapListItem(clap.result.map, clap.result.status.minPlaySpeed),
          };
        }

        // フォールバック（通常は到達しない）
        throw new Error(`Unknown notification action: ${notification.type}`);
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return buildPageResult(items);
  }),

  postUserNotificationRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    await db
      .update(Notifications)
      .set({ checked: true })
      .where(and(eq(Notifications.recipientId, user.id), eq(Notifications.checked, false)));
  }),
} satisfies TRPCRouterRecord;
