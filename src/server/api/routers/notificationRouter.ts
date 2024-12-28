import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const notificationRouter = {
  newNotificationCheck: publicProcedure.query(async () => {
    const session = await auth();
    const userId = session ? Number(session.user.id) : 0;

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
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.date().nullish(), // <-- "cursor" needs to exist, but can be any type
        direction: z.enum(["forward", "backward"]), // optional, useful for bi-directional query      }),
      }),
    )
    .query(async ({ input }) => {
      const session = await auth();
      const userId = session ? Number(session.user.id) : 0;
      const { cursor } = input;
      const limit = input.limit ?? 20;

      try {
        const notifyList = await db.notification.findMany({
          where: {
            visited_id: userId,
          },
          take: limit + 1,
          cursor: cursor ? { createdAt: cursor } : undefined,

          orderBy: {
            createdAt: "desc",
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
        let nextCursor: typeof cursor | undefined = undefined;
        if (notifyList.length > limit) {
          const nextItem = notifyList.pop();
          nextCursor = nextItem!.createdAt;
        }
        return {
          notifications: notifyList,
          nextCursor,
        };
      } catch (error) {
        console.error("Error fetching notification list:", error);
        throw new Error("Internal Server Error");
      }
    }),
  postUserNotificationRead: publicProcedure.mutation(async () => {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const userId = session ? Number(session.user.id) : 0;

    await db.notification.updateMany({
      where: {
        visited_id: userId,
        checked: false,
      },
      data: {
        checked: true,
      },
    });

    return new Response("Notifications marked as read", { status: 200 });
  }),
};
