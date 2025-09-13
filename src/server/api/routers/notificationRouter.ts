import z from "zod";
import { protectedProcedure } from "../trpc";

export const notificationRouter = {
  hasNewNotification: protectedProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    if (!user.id) {
      return false;
    }

    const data = await db.notifications.findFirst({
      where: {
        visited_id: user.id,
        checked: false,
      },
      select: {
        checked: true,
      },
    });

    return data === null ? false : true;
  }),
  getInfiniteUserNotifications: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.date().nullish(), // <-- "cursor" needs to exist, but can be any type
        direction: z.enum(["forward", "backward"]), // optional, useful for bi-directional query      }),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { cursor } = input;
      const limit = input.limit ?? 20;

      try {
        const notifyList = await db.notifications.findMany({
          where: {
            visited_id: user.id,
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
                    user_id: user?.id,
                  },
                  select: {
                    is_liked: true,
                  },
                  take: 1,
                },
                results: {
                  where: {
                    user_id: user?.id,
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
        const normalized = notifyList.map((n) => {
          const { map_likes, difficulty, ...restMap } = n.map;
          return {
            ...n,
            map: {
              ...restMap,
              difficulty: difficulty ?? { roma_kpm_median: 0, roma_kpm_max: 0, total_time: 0 },
              is_liked: (map_likes?.length ?? 0) > 0,
            },
            visitedResult: n.visitedResult
              ? { ...n.visitedResult, status: n.visitedResult.status ?? { score: 0 } }
              : { status: { score: 0 } },
            visitorResult: n.visitorResult
              ? { ...n.visitorResult, status: n.visitorResult.status ?? { score: 0 } }
              : { status: { score: 0 } },
          };
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (normalized.length > limit) {
          const nextItem = normalized.pop();

          if (nextItem) {
            nextCursor = nextItem.created_at;
          }
        }
        return {
          notifications: normalized,
          nextCursor,
        };
      } catch (error) {
        console.error("Error fetching notification list:", error);
        throw new Error("Internal Server Error");
      }
    }),
  postUserNotificationRead: protectedProcedure.mutation(async ({ ctx }) => {
    const { db, user } = ctx;

    await db.notifications.updateMany({
      where: {
        visited_id: user.id,
        checked: false,
      },
      data: {
        checked: true,
      },
    });

    return new Response("Notifications marked as read", { status: 200 });
  }),
};
