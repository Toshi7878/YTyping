import type { TRPCRouterRecord } from "@trpc/server";
import { and, type DBQueryConfig, desc, eq } from "drizzle-orm";
import z from "zod";
import { MapLikes, Notifications, Results } from "@/server/drizzle/schema";
import { buildHasBookmarkedMapExists } from "../lib/map";
import { protectedProcedure } from "../trpc";
import { createPagination } from "../utils/pagination";
import type { MapListItem } from "./map";

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
        createdAt: false,
        creatorId: false,
        playCount: false,
        tags: false,
      },
      extras: (table) => ({
        hasBookmarked: buildHasBookmarkedMapExists(user, table.id).as("has_bookmarked"),
      }),
      with: {
        creator: { columns: { id: true, name: true } },
        difficulty: {
          columns: {
            kanaKpmMedian: true,
            kanaKpmMax: true,
            romaKpmMedian: true,
            romaKpmMax: true,
            romaTotalNotes: true,
            kanaTotalNotes: true,
          },
        },
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
    } satisfies DBQueryConfig;

    const notifications = await db.query.Notifications.findMany({
      columns: {
        id: true,
        type: true,
        updatedAt: true,
      },

      with: {
        mapBookmark: {
          columns: {},
          with: {
            bookmarker: { columns: { id: true, name: true } },
            map: mapQuery,
            list: { columns: { id: true, title: true } },
          },
        },
        overTake: {
          columns: { visitorId: true, prevRank: true },
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
        info: {
          title: map.title,
          artistName: map.artistName,
          source: map.musicSource,
          duration: map.duration,
          categories: map.category,
          visibility: map.visibility,
        },
        creator: { id: map.creator.id, name: map.creator.name },
        difficulty: {
          romaKpmMedian: map.difficulty.romaKpmMedian,
          kanaKpmMedian: map.difficulty.kanaKpmMedian,
          romaKpmMax: map.difficulty.romaKpmMax,
          kanaKpmMax: map.difficulty.kanaKpmMax,
          romaTotalNotes: map.difficulty.romaTotalNotes,
          kanaTotalNotes: map.difficulty.kanaTotalNotes,
        },
        like: { count: map.likeCount, hasLiked: map.mapLikes?.[0]?.hasLiked ?? false },
        ranking: {
          count: map.rankingCount,
          myRank: map.results?.[0]?.rank ?? null,
          myRankUpdatedAt: map.results?.[0]?.updatedAt ?? null,
        },
        bookmark: { hasBookmarked: !!map.hasBookmarked },
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

        if (notification.type === "MAP_BOOKMARK" && notification.mapBookmark) {
          const { mapBookmark } = notification;

          return {
            id: notification.id,
            type: notification.type,
            updatedAt: notification.updatedAt,
            bookmarker: mapBookmark.bookmarker,
            map: toMapListItem(mapBookmark.map),
            mapBookmark: notification.mapBookmark,
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
