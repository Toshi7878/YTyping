import type { TRPCRouterRecord } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import z from "zod";
import { type maps, notifications } from "@/server/drizzle/schema";
import { bookmarkedMapExists } from "../lib/map";
import { protectedProcedure } from "../trpc";
import { createPagination } from "../utils/pagination";
import type { MapListItem } from "./map";

export const notificationRouter = {
  hasUnread: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    const isUnreadNotificationFound = await db.query.notifications
      .findFirst({
        columns: { checked: true },
        where: { recipientId: session.user.id, checked: false },
      })
      .then((res) => res !== undefined);

    return isUnreadNotificationFound;
  }),

  getInfinite: protectedProcedure.input(z.object({ cursor: z.number().optional() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
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
      extras: {
        hasBookmarked: (map: typeof maps) => bookmarkedMapExists(db, session, map.id).as("has_bookmarked"),
      },
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
            kanaChunkCount: true,
            alphabetChunkCount: true,
            numChunkCount: true,
            spaceChunkCount: true,
            symbolChunkCount: true,
            rating: true,
          },
        },
        mapLikes: {
          where: { userId: session.user.id },
          columns: { hasLiked: true },
          limit: 1,
        },
        results: {
          where: { userId: session.user.id },
          columns: { rank: true, updatedAt: true },
          limit: 1,
        },
      },
    } as const;

    const notifications = await db.query.notifications.findMany({
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
      where: { recipientId: session.user.id },
      orderBy: { updatedAt: "desc" },
      limit,
      offset,
    });

    type NotificationMap = NonNullable<NonNullable<(typeof notifications)[number]["overTake"]>["map"]>;
    const toMapListItem = (map: NotificationMap, previewSpeed?: number) => {
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
          kanaChunkCount: map.difficulty.kanaChunkCount,
          alphabetChunkCount: map.difficulty.alphabetChunkCount,
          numChunkCount: map.difficulty.numChunkCount,
          spaceChunkCount: map.difficulty.spaceChunkCount,
          symbolChunkCount: map.difficulty.symbolChunkCount,
          rating: map.difficulty.rating,
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
    const { db, session } = ctx;

    await db
      .update(notifications)
      .set({ checked: true })
      .where(and(eq(notifications.recipientId, session.user.id), eq(notifications.checked, false)));
  }),
} satisfies TRPCRouterRecord;

export const generateNotificationId = () => nanoid(10);
