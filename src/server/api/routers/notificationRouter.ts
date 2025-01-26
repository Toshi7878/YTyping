import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const notificationRouter = {
  newNotificationCheck: publicProcedure.query(async () => {
    const session = await auth();
    const userId = session ? Number(session.user.id) : 0;

    const data = await prisma.notifications.findFirst({
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
      })
    )
    .query(async ({ input }) => {
      const session = await auth();
      const userId = session ? Number(session.user.id) : 0;
      const { cursor } = input;
      const limit = input.limit ?? 20;

      try {
        const notifyList = await prisma.notifications.findMany({
          where: {
            visited_id: userId,
          },
          take: limit + 1,
          cursor: cursor ? { created_at: cursor } : undefined,

          orderBy: {
            created_at: "desc",
          },
          select: {
            created_at: true,
            action: true,
            visitor_id: true,
            old_rank: true,
            visitor: {
              select: {
                name: true,
              },
            },
            visitedResult: {
              select: {
                status: {
                  select: {
                    score: true,
                  },
                },
              },
            },

            visitorResult: {
              select: {
                status: {
                  select: {
                    score: true,
                  },
                },
              },
            },
            map: {
              select: {
                id: true,
                title: true,
                artist_name: true,
                music_source: true,
                video_id: true,
                creator_id: true,
                updated_at: true,
                preview_time: true,
                thumbnail_quality: true,
                like_count: true,
                ranking_count: true,

                difficulty: {
                  select: {
                    roma_kpm_median: true,
                    roma_kpm_max: true,
                    total_time: true,
                  },
                },
                map_likes: {
                  where: {
                    user_id: userId,
                  },
                  select: {
                    is_liked: true,
                  },
                },
                results: {
                  where: {
                    user_id: userId,
                  },
                  select: {
                    rank: true,
                  },
                },
                creator: {
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
          nextCursor = nextItem!.created_at;
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

    await prisma.notifications.updateMany({
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
