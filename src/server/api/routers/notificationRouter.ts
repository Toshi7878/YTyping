import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const notificationRouter = {
  newNotificationCheck: publicProcedure.query(async () => {
    const session = await auth();
    const userId = Number(session?.user.id);

    const data = await db.notification.findFirst({
      where: {
        visited_id: userId,
        checked: false,
      },
      select: {
        checked: true,
      },
    });

    return data === null ? false : true;
  }),
  getInfiniteUserNotifications: publicProcedure
    .input(
      z.object({
        cursor: z.number().nullish(), // <--- cursor を含めないと client 側で useInfiniteQuery hooks が現れない
      }),
    )
    .query(async ({ input }) => {
      const cursor = input.cursor ?? 0;
      const session = await auth();
      const userId = session ? Number(session.user.id) : 0;
      const take = 20; //ここを編集したらInfiniteQueryのgetNextPageParamも編集する
      const skip = take * cursor;

      try {
        const notifyList = await db.notification.findMany({
          where: {
            visited_id: userId,
          },
          skip,
          take,
          orderBy: {
            createdAt: "desc", // 作成日時の新しい順にソート
          },
          select: {
            createdAt: true,
            action: true,
            visitor_id: true,
            oldRank: true,
            visitor: {
              select: {
                name: true,
              },
            },
            visitedResult: {
              select: {
                score: true,
              },
            },
            visitorResult: {
              select: {
                score: true,
              },
            },
            map: {
              select: {
                id: true,
                title: true,
                artistName: true,
                musicSource: true,
                romaKpmMedian: true,
                romaKpmMax: true,
                videoId: true,
                creatorId: true,
                updatedAt: true,
                previewTime: true,
                totalTime: true,
                thumbnailQuality: true,
                likeCount: true,
                rankingCount: true,
                mapLike: {
                  where: {
                    userId,
                  },
                  select: {
                    isLiked: true,
                  },
                },
                result: {
                  where: {
                    userId,
                  },
                  select: {
                    rank: true,
                  },
                },
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        });

        const nextCursor = notifyList.length < take ? null : cursor + 1;

        return {
          notifications: notifyList,
          nextCursor,
        };
      } catch (error) {
        console.error("Error fetching notification list:", error);
        throw new Error("Internal Server Error");
      }
    }),
};
