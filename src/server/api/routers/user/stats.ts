import type { TRPCRouterRecord } from "@trpc/server";
import { eachDayOfInterval } from "date-fns";
import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import type { OpenApiContentType } from "trpc-to-openapi";
import z from "zod";
import {
  Maps,
  UserDailyTypeCounts,
  UserMapCompletionPlayCounts,
  UserOptions,
  UserStats,
} from "@/server/drizzle/schema";
import { IncrementImeTypeCountStatsSchema, IncrementTypingCountStatsSchema } from "@/validator/user-stats";
import { publicProcedure } from "../../trpc";
import { formatDateKeyInTimeZone, getNowInTimeZone, getYearDateRangeInTimeZone } from "../../utils/date";

export const userStatsRouter = {
  get: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;

    const userStats = await db
      .select({
        createdAt: UserStats.createdAt,
        totalPlayCount: UserStats.totalPlayCount,
        totalRankingCount: UserStats.totalRankingCount,
        maxCombo: UserStats.maxCombo,
        totalTypingTime: UserStats.totalTypingTime,
        typeCounts: {
          romaTypeTotalCount: UserStats.romaTypeTotalCount,
          kanaTypeTotalCount: UserStats.kanaTypeTotalCount,
          flickTypeTotalCount: UserStats.flickTypeTotalCount,
          englishTypeTotalCount: UserStats.englishTypeTotalCount,
          spaceTypeTotalCount: UserStats.spaceTypeTotalCount,
          symbolTypeTotalCount: UserStats.symbolTypeTotalCount,
          numTypeTotalCount: UserStats.numTypeTotalCount,
          totalPlayCount: UserStats.totalPlayCount,
          imeTypeTotalCount: UserStats.imeTypeTotalCount,
        },
        options: {
          hideUserStats: UserOptions.hideUserStats,
        },
      })
      .from(UserStats)
      .leftJoin(UserOptions, eq(UserOptions.userId, input.userId))
      .where(eq(UserStats.userId, input.userId))
      .limit(1)
      .then((rows) => rows?.[0] ?? null);

    return userStats;
  }),

  getYearlyTypingActivity: publicProcedure
    .input(z.object({ userId: z.number(), targetYear: z.number().nullish(), timezone: z.string() }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const currentYear = getNowInTimeZone(input.timezone).getFullYear();
      const { startOfYear, endOfYear } = getYearDateRangeInTimeZone(input.targetYear ?? currentYear);

      const dataMap = await db.query.UserDailyTypeCounts.findMany({
        columns: {
          romaTypeCount: true,
          kanaTypeCount: true,
          flickTypeCount: true,
          englishTypeCount: true,
          otherTypeCount: true,
          imeTypeCount: true,
          date: true,
        },
        where: and(
          eq(UserDailyTypeCounts.userId, input.userId),
          gte(UserDailyTypeCounts.date, startOfYear),
          lte(UserDailyTypeCounts.date, endOfYear),
        ),
        orderBy: asc(UserDailyTypeCounts.date),
      }).then((records) => {
        return new Map(
          records.map((record) => {
            const dateKey = formatDateKeyInTimeZone(record.date, input.timezone);
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

    return await db.query.UserDailyTypeCounts.findFirst({
      columns: { date: true },
      where: eq(UserDailyTypeCounts.userId, input.userId),
      orderBy: asc(UserDailyTypeCounts.date),
    }).then((res) => (res?.date ?? new Date()).getUTCFullYear());
  }),

  incrementMapCompletionPlayCount: publicProcedure
    .input(z.object({ mapId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      if (!user) return;
      const { mapId } = input;

      await db
        .insert(UserMapCompletionPlayCounts)
        .values({ userId: user.id, mapId: mapId, count: 1 })
        .onConflictDoUpdate({
          target: [UserMapCompletionPlayCounts.userId, UserMapCompletionPlayCounts.mapId],
          set: { count: sql`${UserMapCompletionPlayCounts.count} + 1` },
        });
    }),

  incrementPlayCountStats: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/user-stats/play-count/increment",
        protect: false,
        tags: ["UserStats"],
        summary: "Increment map play count and user total play count",
        contentTypes: ["application/json" as OpenApiContentType],
      },
    })
    .input(z.object({ mapId: z.number() }))
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { mapId } = input;

      await db
        .update(Maps)
        .set({ playCount: sql`${Maps.playCount} + 1` })
        .where(eq(Maps.id, mapId));

      if (!user) return;
      await db
        .insert(UserStats)
        .values({ userId: user.id, totalPlayCount: 1 })
        .onConflictDoUpdate({
          target: [UserStats.userId],
          set: { totalPlayCount: sql`${UserStats.totalPlayCount} + 1` },
        });
    }),

  incrementImeStats: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/user-stats/ime/increment",
        protect: true,
        tags: ["UserStats"],
        summary: "Increment IME typing stats",
        contentTypes: ["application/json" as OpenApiContentType],
      },
    })
    .input(IncrementImeTypeCountStatsSchema)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx;
      if (!user) return;
      const isAllZero = input.typingTime === 0 && input.imeTypeCount === 0;
      if (isAllZero) return;

      await db
        .insert(UserStats)
        .values({ userId: user.id, ...input })
        .onConflictDoUpdate({
          target: [UserStats.userId],
          set: {
            imeTypeTotalCount: sql`${UserStats.imeTypeTotalCount} + ${input.imeTypeCount}`,
            totalTypingTime: sql`${UserStats.totalTypingTime} + ${input.typingTime}`,
          },
        });

      const date = getNowInTimeZone(input.timezone);

      await db
        .insert(UserDailyTypeCounts)
        .values({ userId: user.id, date, imeTypeCount: input.imeTypeCount })
        .onConflictDoUpdate({
          target: [UserDailyTypeCounts.userId, UserDailyTypeCounts.date],
          set: { imeTypeCount: sql`${UserDailyTypeCounts.imeTypeCount} + ${input.imeTypeCount}` },
        });
    }),

  incrementTypingStats: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/user-stats/typing/increment",
        protect: true,
        tags: ["UserStats"],
        summary: "Increment typing stats",
        contentTypes: ["application/json" as OpenApiContentType],
      },
    })
    .input(IncrementTypingCountStatsSchema)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      const { user, db } = ctx;
      if (!user) return;

      const isAllZero =
        input.romaType === 0 &&
        input.kanaType === 0 &&
        input.flickType === 0 &&
        input.englishType === 0 &&
        input.spaceType === 0 &&
        input.symbolType === 0 &&
        input.numType === 0 &&
        input.typingTime === 0 &&
        input.maxCombo === 0;
      if (isAllZero) return;

      const currentMaxCombo = await db.query.UserStats.findFirst({
        columns: { maxCombo: true },
        where: eq(UserStats.userId, user.id),
      }).then((res) => res?.maxCombo ?? 0);

      const isUpdateMaxCombo = input.maxCombo > currentMaxCombo;

      await db
        .insert(UserStats)
        .values({ userId: user.id, ...input })
        .onConflictDoUpdate({
          target: [UserStats.userId],
          set: {
            romaTypeTotalCount: sql`${UserStats.romaTypeTotalCount} + ${input.romaType}`,
            kanaTypeTotalCount: sql`${UserStats.kanaTypeTotalCount} + ${input.kanaType}`,
            flickTypeTotalCount: sql`${UserStats.flickTypeTotalCount} + ${input.flickType}`,
            englishTypeTotalCount: sql`${UserStats.englishTypeTotalCount} + ${input.englishType}`,
            numTypeTotalCount: sql`${UserStats.numTypeTotalCount} + ${input.numType}`,
            symbolTypeTotalCount: sql`${UserStats.symbolTypeTotalCount} + ${input.symbolType}`,
            spaceTypeTotalCount: sql`${UserStats.spaceTypeTotalCount} + ${input.spaceType}`,
            totalTypingTime: sql`${UserStats.totalTypingTime} + ${input.typingTime}`,
            ...(isUpdateMaxCombo ? { maxCombo: input.maxCombo } : {}),
          },
        });

      const date = getNowInTimeZone(input.timezone);

      await db
        .insert(UserDailyTypeCounts)
        .values({
          userId: user.id,
          date,
          romaTypeCount: input.romaType,
          kanaTypeCount: input.kanaType,
          flickTypeCount: input.flickType,
          englishTypeCount: input.englishType,
          otherTypeCount: input.spaceType + input.numType + input.symbolType,
        })
        .onConflictDoUpdate({
          target: [UserDailyTypeCounts.userId, UserDailyTypeCounts.date],
          set: {
            romaTypeCount: sql`${UserDailyTypeCounts.romaTypeCount} + ${input.romaType}`,
            kanaTypeCount: sql`${UserDailyTypeCounts.kanaTypeCount} + ${input.kanaType}`,
            flickTypeCount: sql`${UserDailyTypeCounts.flickTypeCount} + ${input.flickType}`,
            englishTypeCount: sql`${UserDailyTypeCounts.englishTypeCount} + ${input.englishType}`,
            otherTypeCount: sql`${UserDailyTypeCounts.otherTypeCount} + ${input.spaceType + input.numType + input.symbolType}`,
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
