import { schema } from "@/server/drizzle/client";
import { and, eq, sql } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../trpc";

export const notificationRouter = {
  hasNewNotification: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({ one: sql`1` })
      .from(schema.notifications)
      .where(and(eq(schema.notifications.visitedId, ctx.user.id), eq(schema.notifications.checked, false)))
      .limit(1);

    return rows.length > 0;
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
        const cond = cursor ? sql`AND n."created_at" < ${cursor}` : sql``;
        const notifyRows = (
          await db.execute(sql`
          SELECT
            n."created_at",
            n."action",
            n."visitor_id",
            n."old_rank",
            u."name" as visitor_name,
            (
              SELECT rs."score" FROM results r
              JOIN result_statuses rs ON rs."result_id" = r."id"
              WHERE r."map_id" = n."map_id" AND r."user_id" = n."visited_id"
              ORDER BY rs."score" DESC
              LIMIT 1
            ) as visited_score,
            (
              SELECT rs2."score" FROM results r2
              JOIN result_statuses rs2 ON rs2."result_id" = r2."id"
              WHERE r2."map_id" = n."map_id" AND r2."user_id" = n."visitor_id"
              ORDER BY rs2."score" DESC
              LIMIT 1
            ) as visitor_score,
            json_build_object(
              'id', m."id",
              'title', m."title",
              'artist_name', m."artist_name",
              'music_source', m."music_source",
              'video_id', m."video_id",
              'creator_id', m."creator_id",
              'updated_at', m."updated_at",
              'preview_time', m."preview_time",
              'thumbnail_quality', m."thumbnail_quality",
              'like_count', m."like_count",
              'ranking_count', m."ranking_count",
              'difficulty', json_build_object(
                'roma_kpm_median', d."roma_kpm_median",
                'roma_kpm_max', d."roma_kpm_max",
                'total_time', d."total_time"
              ),
              'creator', json_build_object('id', cu."id", 'name', cu."name"),
              'is_liked', EXISTS (
                SELECT 1 FROM map_likes ml WHERE ml."map_id" = m."id" AND ml."user_id" = ${user.id} AND ml."is_liked" = true
              ),
              'myRank', (
                SELECT MIN(r3."rank")::int FROM results r3 WHERE r3."map_id" = m."id" AND r3."user_id" = ${user.id}
              )
            ) as "map"
          FROM notifications n
          JOIN users u ON u."id" = n."visitor_id"
          JOIN maps m ON m."id" = n."map_id"
          LEFT JOIN map_difficulties d ON d."map_id" = m."id"
          LEFT JOIN users cu ON cu."id" = m."creator_id"
          WHERE n."visited_id" = ${user.id}
          ${cond}
          ORDER BY n."created_at" DESC
          LIMIT ${limit + 1}
        `)
        ).rows as any[];
        const normalized = notifyRows.map((n) => ({
          created_at: n.created_at,
          action: n.action,
          visitor_id: n.visitor_id,
          old_rank: n.old_rank,
          visitor: { name: n.visitor_name },
          visitedResult: { status: { score: n.visited_score ?? 0 } },
          visitorResult: { status: { score: n.visitor_score ?? 0 } },
          map: {
            ...n.map,
            difficulty: n.map?.difficulty ?? { roma_kpm_median: 0, roma_kpm_max: 0, total_time: 0 },
          },
        }));

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

    await db
      .update(schema.notifications)
      .set({ checked: true })
      .where(and(eq(schema.notifications.visitedId, user.id), eq(schema.notifications.checked, false)));

    return new Response("Notifications marked as read", { status: 200 });
  }),
};
