import { MapLikes, Notifications, Results } from "@/server/drizzle/schema";
import { and, desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../trpc";

export const notificationRouter = {
  hasNewNotification: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ one: sql`1` })
      .from(Notifications)
      .where(and(eq(Notifications.visitedId, ctx.user.id), eq(Notifications.checked, false)))
      .limit(1);

    return rows.length > 0;
  }),
  getInfiniteUserNotifications: protectedProcedure
    .input(
      z.object({
        // Use page-index style cursor for offset pagination
        cursor: z.string().nullable().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const PAGE_SIZE = 20;

      const page = input.cursor ? Number(input.cursor) : 0;
      const offset = isNaN(page) ? 0 : page * PAGE_SIZE;

      try {
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
                difficulty: { columns: { totalTime: true, romaKpmMedian: true, romaKpmMax: true } },
                mapLikes: {
                  where: and(eq(MapLikes.userId, user.id)),
                  columns: { isLiked: true },
                  limit: 1,
                },
                results: {
                  where: and(eq(Results.userId, user.id)),
                  columns: { rank: true },
                  limit: 1,
                },
              },
            },
            // 結果は (user_id, map_id) が一意なので max は不要
            visitedResult: { with: { status: { columns: { score: true } } } },
            visitorResult: { with: { status: { columns: { score: true } } } },
          },
        });

        const items = notifications.map((n) => ({
          created_at: n.createdAt,
          action: n.action,
          visitor: {
            id: n.visitorId,
            name: n.visitor?.name ?? null,
            score: n.visitorResult?.status?.score ?? null,
          },
          myResult: {
            old_rank: n.oldRank,
            score: n.visitedResult?.status?.score ?? null,
          },
          map: {
            id: n.map.id,
            videoId: n.map.videoId,
            title: n.map.title,
            artistName: n.map.artistName,
            musicSource: n.map.musicSource,
            previewTime: n.map.previewTime,
            thumbnailQuality: n.map.thumbnailQuality,
            likeCount: n.map.likeCount,
            rankingCount: n.map.rankingCount,
            updatedAt: n.map.updatedAt,
            creator: { id: n.map.creator.id, name: n.map.creator.name },
            totalTime: n.map.difficulty.totalTime,
            difficulty: {
              romaKpmMedian: n.map.difficulty.romaKpmMedian,
              romaKpmMax: n.map.difficulty.romaKpmMax,
            },
            hasLiked: n.map.mapLikes?.[0]?.isLiked,
            myRank: n.map.results?.[0]?.rank ?? null,
          },
        }));

        let nextCursor: string | undefined = undefined;
        if (items.length > PAGE_SIZE) {
          items.pop();
          nextCursor = String(isNaN(page) ? 1 : page + 1);
        }
        return { notifications: items, nextCursor };
      } catch (error) {
        console.error("Error fetching notification list:", error);
        throw new Error("Internal Server Error");
      }
    }),
  postUserNotificationRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    await db
      .update(Notifications)
      .set({ checked: true })
      .where(and(eq(Notifications.visitedId, user.id), eq(Notifications.checked, false)));

    return new Response("Notifications marked as read", { status: 200 });
  }),
};
