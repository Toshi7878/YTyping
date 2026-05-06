import type { TRPCRouterRecord } from "@trpc/server";
import { eachDayOfInterval } from "date-fns";
import { and, asc, count, desc, eq, gt, sql } from "drizzle-orm";
import z from "zod";
import {
  maps,
  results,
  userDailyTypeCounts,
  userMapCompletionPlayCounts,
  userOptions,
  userStats,
  users,
} from "@/server/drizzle/schema";
import { IncrementImeTypeCountStatsSchema, IncrementTypingCountStatsSchema } from "@/validator/user/stats";
import { createRateLimitMiddleware, protectedProcedure, publicProcedure } from "../../trpc";
import { formatDateKeyInTimeZone, getNowInTimeZone, getYearDateRangeInTimeZone } from "../../utils/date";
import { createPagination } from "../../utils/pagination";

const userStatsWriteRateLimit = createRateLimitMiddleware({
  keyPrefix: "ratelimit:user-stats:write",
  max: 30,
  window: "60 s",
});

export const userStatsRouter = {
  get: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;

    const stats = await db
      .select({
        createdAt: userStats.createdAt,
        totalPlayCount: userStats.totalPlayCount,
        totalRankingCount: userStats.totalRankingCount,
        maxCombo: userStats.maxCombo,
        totalPP: userStats.totalPp,
        totalTypingTime: userStats.totalTypingTime,
        typeCounts: {
          romaTypeTotalCount: userStats.romaTypeTotalCount,
          kanaTypeTotalCount: userStats.kanaTypeTotalCount,
          flickTypeTotalCount: userStats.flickTypeTotalCount,
          englishTypeTotalCount: userStats.englishTypeTotalCount,
          spaceTypeTotalCount: userStats.spaceTypeTotalCount,
          symbolTypeTotalCount: userStats.symbolTypeTotalCount,
          numTypeTotalCount: userStats.numTypeTotalCount,
          totalPlayCount: userStats.totalPlayCount,
          imeTypeTotalCount: userStats.imeTypeTotalCount,
        },
        options: {
          hideUserStats: userOptions.hideUserStats,
        },
      })
      .from(userStats)
      .leftJoin(userOptions, eq(userOptions.userId, input.userId))
      .where(eq(userStats.userId, input.userId))
      .limit(1)
      .then((rows) => rows?.[0] ?? null);

    return stats;
  }),

  /** total PP 順のユーザーランキング（ページネーション） */
  getPPRanking: publicProcedure
    .input(
      z.object({
        cursor: z.number().int().optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const { offset, limit, buildPageResult } = createPagination(input.cursor, 30);

      const rows = await db
        .select({
          userId: users.id,
          name: users.name,
          totalPP: userStats.totalPp,
        })
        .from(userStats)
        .innerJoin(users, eq(users.id, userStats.userId))
        .where(eq(users.banned, false))
        .orderBy(desc(userStats.totalPp), asc(users.id))
        .limit(limit)
        .offset(offset);

      const rowsWithRank = rows.map((row, index) => ({
        ...row,
        rank: offset + index + 1,
      }));

      return buildPageResult(rowsWithRank);
    }),

  /** 指定ユーザーの total PP 順位（同率は最上位を返す）。stats 未作成の場合は総ユーザー数（最下位）を返す。 */
  getMyPpRank: protectedProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;

    const myStats = await db
      .select({ totalPP: userStats.totalPp })
      .from(userStats)
      .where(eq(userStats.userId, session.user.id))
      .limit(1)
      .then((rows) => rows[0] ?? null);

    if (!myStats) {
      return db
        .select({ count: count() })
        .from(userStats)
        .innerJoin(users, eq(users.id, userStats.userId))
        .where(eq(users.banned, false))
        .then((rows) => rows[0]?.count ?? 0);
    }

    const aboveCount = await db
      .select({ count: count() })
      .from(userStats)
      .innerJoin(users, eq(users.id, userStats.userId))
      .where(and(eq(users.banned, false), gt(userStats.totalPp, myStats.totalPP)))
      .then((rows) => rows[0]?.count ?? 0);

    return aboveCount + 1;
  }),

  getRankingSummary: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;
    const { userId } = input;

    return db
      .select({
        totalResultCount: count(),
        firstRankCount: sql<number>`cast(count(*) filter (where ${results.rank} = 1) as int)`,
      })
      .from(results)
      .where(eq(results.userId, userId))
      .then((rows) => rows[0] ?? { totalResultCount: 0, firstRankCount: 0 });
  }),

  getYearlyTypingActivity: publicProcedure
    .input(z.object({ userId: z.number(), targetYear: z.number().nullish(), timezone: z.string() }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const currentYear = getNowInTimeZone(input.timezone).getFullYear();
      const { startOfYear, endOfYear } = getYearDateRangeInTimeZone(input.targetYear ?? currentYear);
      const startDateKey = formatDateKeyInTimeZone(startOfYear);
      const endDateKey = formatDateKeyInTimeZone(endOfYear);

      const dataMap = await db.query.userDailyTypeCounts
        .findMany({
          columns: {
            romaTypeCount: true,
            kanaTypeCount: true,
            flickTypeCount: true,
            englishTypeCount: true,
            otherTypeCount: true,
            imeTypeCount: true,
            date: true,
          },
          where: {
            userId: input.userId,
            date: {
              gte: startDateKey,
              lte: endDateKey,
            },
          },
          orderBy: { date: "asc" },
        })
        .then((records) => {
          return new Map(
            records.map((record) => {
              const dateKey = record.date;
              const { date: _, ...dayData } = record;
              return [dateKey, dayData];
            }),
          );
        });

      const days = eachDayOfInterval({ start: startOfYear, end: endOfYear });

      return days.map((day) => {
        const dateKey = formatDateKeyInTimeZone(day, input.timezone);
        const existingData = dataMap.get(dateKey);

        if (!existingData) {
          return { date: dateKey, count: 0, level: 0, data: undefined };
        }

        const typeCounts = [
          { type: "roma", count: existingData.romaTypeCount },
          { type: "kana", count: existingData.kanaTypeCount },
          {
            type: "other",
            count: existingData.flickTypeCount + existingData.englishTypeCount + existingData.otherTypeCount,
          },
          { type: "ime", count: existingData.imeTypeCount },
        ] as const;

        const dominantType = typeCounts.reduce((max, current) => (current.count > max.count ? current : max));
        const totalTypeCount = Object.values(existingData).reduce((total, count) => total + count, 0);
        const level = getActivityLevel({ type: dominantType.type, totalTypeCount });

        return { date: dateKey, count: totalTypeCount, level, data: existingData };
      });
    }),

  getActivityOldestYear: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;

    return await db.query.userDailyTypeCounts
      .findFirst({
        columns: { date: true },
        where: { userId: input.userId },
        orderBy: { date: "asc" },
      })
      .then((res) => (res?.date ? new Date(res.date) : new Date()).getUTCFullYear());
  }),

  incrementMapCompletionPlayCount: protectedProcedure
    .use(userStatsWriteRateLimit)
    .input(z.object({ mapId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;
      const { mapId } = input;

      await db
        .insert(userMapCompletionPlayCounts)
        .values({ userId: session.user.id, mapId: mapId, count: 1 })
        .onConflictDoUpdate({
          target: [userMapCompletionPlayCounts.userId, userMapCompletionPlayCounts.mapId],
          set: { count: sql`${userMapCompletionPlayCounts.count} + 1` },
        });
    }),

  incrementPlayCountStats: publicProcedure
    .use(userStatsWriteRateLimit)
    .meta({
      openapi: {
        method: "POST",
        path: "/user-stats/play-count/increment",
      },
    })
    .input(z.object({ mapId: z.number() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;
      const { mapId } = input;

      await db
        .update(maps)
        .set({ playCount: sql`${maps.playCount} + 1` })
        .where(eq(maps.id, mapId));

      if (!session) return;
      await db
        .insert(userStats)
        .values({ userId: session.user.id, totalPlayCount: 1 })
        .onConflictDoUpdate({
          target: [userStats.userId],
          set: { totalPlayCount: sql`${userStats.totalPlayCount} + 1` },
        });
    }),

  incrementImeStats: protectedProcedure
    .use(userStatsWriteRateLimit)
    .meta({
      openapi: {
        method: "POST",
        path: "/user-stats/ime/increment",
      },
    })
    .input(IncrementImeTypeCountStatsSchema)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;

      await db
        .insert(userStats)
        .values({ userId: session.user.id, ...input })
        .onConflictDoUpdate({
          target: [userStats.userId],
          set: {
            imeTypeTotalCount: sql`${userStats.imeTypeTotalCount} + ${input.imeTypeCount}`,
            totalTypingTime: sql`${userStats.totalTypingTime} + ${input.typingTime}`,
          },
        });

      const date = formatDateKeyInTimeZone(getNowInTimeZone(input.timezone));

      await db
        .insert(userDailyTypeCounts)
        .values({ userId: session.user.id, date, imeTypeCount: input.imeTypeCount })
        .onConflictDoUpdate({
          target: [userDailyTypeCounts.userId, userDailyTypeCounts.date],
          set: { imeTypeCount: sql`${userDailyTypeCounts.imeTypeCount} + ${input.imeTypeCount}` },
        });
    }),

  incrementTypingStats: protectedProcedure
    .use(userStatsWriteRateLimit)
    .meta({
      openapi: {
        method: "POST",
        path: "/user-stats/typing/increment",
      },
    })
    .input(IncrementTypingCountStatsSchema)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;

      const currentMaxCombo = await db.query.userStats
        .findFirst({
          columns: { maxCombo: true },
          where: { userId: session.user.id },
        })
        .then((res) => res?.maxCombo ?? 0);

      const isUpdateMaxCombo = input.maxCombo > currentMaxCombo;

      await db
        .insert(userStats)
        .values({ userId: session.user.id, ...input })
        .onConflictDoUpdate({
          target: [userStats.userId],
          set: {
            romaTypeTotalCount: sql`${userStats.romaTypeTotalCount} + ${input.romaType}`,
            kanaTypeTotalCount: sql`${userStats.kanaTypeTotalCount} + ${input.kanaType}`,
            flickTypeTotalCount: sql`${userStats.flickTypeTotalCount} + ${input.flickType}`,
            englishTypeTotalCount: sql`${userStats.englishTypeTotalCount} + ${input.englishType}`,
            numTypeTotalCount: sql`${userStats.numTypeTotalCount} + ${input.numType}`,
            symbolTypeTotalCount: sql`${userStats.symbolTypeTotalCount} + ${input.symbolType}`,
            spaceTypeTotalCount: sql`${userStats.spaceTypeTotalCount} + ${input.spaceType}`,
            totalTypingTime: sql`${userStats.totalTypingTime} + ${input.typingTime}`,
            ...(isUpdateMaxCombo ? { maxCombo: input.maxCombo } : {}),
          },
        });

      const date = formatDateKeyInTimeZone(getNowInTimeZone(input.timezone));

      await db
        .insert(userDailyTypeCounts)
        .values({
          userId: session.user.id,
          date,
          romaTypeCount: input.romaType,
          kanaTypeCount: input.kanaType,
          flickTypeCount: input.flickType,
          englishTypeCount: input.englishType,
          otherTypeCount: input.spaceType + input.numType + input.symbolType,
        })
        .onConflictDoUpdate({
          target: [userDailyTypeCounts.userId, userDailyTypeCounts.date],
          set: {
            romaTypeCount: sql`${userDailyTypeCounts.romaTypeCount} + ${input.romaType}`,
            kanaTypeCount: sql`${userDailyTypeCounts.kanaTypeCount} + ${input.kanaType}`,
            flickTypeCount: sql`${userDailyTypeCounts.flickTypeCount} + ${input.flickType}`,
            englishTypeCount: sql`${userDailyTypeCounts.englishTypeCount} + ${input.englishType}`,
            otherTypeCount: sql`${userDailyTypeCounts.otherTypeCount} + ${input.spaceType + input.numType + input.symbolType}`,
          },
        });
    }),
} satisfies TRPCRouterRecord;

const getActivityLevel = ({ type, totalTypeCount }: { type: keyof typeof LEVELS; totalTypeCount: number }): number => {
  const sortedLevels = Object.entries(LEVELS[type])
    .map(([level, threshold]) => ({ level: parseInt(level, 10), threshold }))
    .sort((a, b) => b.level - a.level);

  for (const { level, threshold } of sortedLevels) {
    if (totalTypeCount >= threshold) {
      return level;
    }
  }

  return 0;
};

const LEVELS = {
  roma: {
    3: 15000 as const,
    2: 5000 as const,
    1: 1 as const,
  },
  kana: {
    6: 12000 as const,
    5: 5000 as const,
    4: 1 as const,
  },
  other: {
    9: 15000 as const,
    8: 5000 as const,
    7: 1 as const,
  },
  ime: {
    12: 10000 as const,
    11: 1000 as const,
    10: 1 as const,
  },
};
