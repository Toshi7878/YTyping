import type { TRPCRouterRecord } from "@trpc/server";
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
import {
  IncrementImeTypeCountStatsSchema,
  IncrementTypingCountStatsSchema,
} from "@/server/drizzle/validator/user-stats";
import { publicProcedure } from "../trpc";

export const userStatsRouter = {
  getUserStats: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
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

      // DBの日付変更基準（15:00）に合わせて日付を計算
      const now = new Date();
      const isAfterCutoff = now.getHours() >= 15;
      const targetDate = new Date();

      // 15時前なら前日の日付、15時以降なら当日の日付
      if (isAfterCutoff) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const dbDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);

      await db
        .insert(UserDailyTypeCounts)
        .values({ userId: user.id, createdAt: dbDate, imeTypeCount: input.imeTypeCount })
        .onConflictDoUpdate({
          target: [UserDailyTypeCounts.userId, UserDailyTypeCounts.createdAt],
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

      // DBの日付変更基準（15:00）に合わせて日付を計算
      const now = new Date();
      const isAfterCutoff = now.getHours() >= 15;
      const targetDate = new Date();

      // 15時前なら前日の日付、15時以降なら当日の日付
      if (isAfterCutoff) {
        targetDate.setDate(targetDate.getDate() + 1);
      }

      const dbDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0, 0);

      await db
        .insert(UserDailyTypeCounts)
        .values({
          userId: user.id,
          createdAt: dbDate,
          romaTypeCount: input.romaType,
          kanaTypeCount: input.kanaType,
          flickTypeCount: input.flickType,
          englishTypeCount: input.englishType,
          otherTypeCount: input.spaceType + input.numType + input.symbolType,
        })
        .onConflictDoUpdate({
          target: [UserDailyTypeCounts.userId, UserDailyTypeCounts.createdAt],
          set: {
            romaTypeCount: sql`${UserDailyTypeCounts.romaTypeCount} + ${input.romaType}`,
            kanaTypeCount: sql`${UserDailyTypeCounts.kanaTypeCount} + ${input.kanaType}`,
            flickTypeCount: sql`${UserDailyTypeCounts.flickTypeCount} + ${input.flickType}`,
            englishTypeCount: sql`${UserDailyTypeCounts.englishTypeCount} + ${input.englishType}`,
            otherTypeCount: sql`${UserDailyTypeCounts.otherTypeCount} + ${input.spaceType + input.numType + input.symbolType}`,
          },
        });
    }),
  getUserActivity: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const userActivityTypeCounts = await db.query.UserDailyTypeCounts.findMany({
      columns: {
        romaTypeCount: true,
        kanaTypeCount: true,
        flickTypeCount: true,
        englishTypeCount: true,
        otherTypeCount: true,
        imeTypeCount: true,
        createdAt: true,
      },
      where: and(
        eq(UserDailyTypeCounts.userId, input.userId),
        gte(UserDailyTypeCounts.createdAt, startOfYear),
        lte(UserDailyTypeCounts.createdAt, endOfYear),
      ),
      orderBy: asc(UserDailyTypeCounts.createdAt),
    });

    type DayCounts = Omit<(typeof userActivityTypeCounts)[number], "createdAt">;
    const dataMap = new Map<string, DayCounts>();
    userActivityTypeCounts.forEach((record) => {
      const dateKey = new Date(record.createdAt).toISOString().split("T")[0]!;
      const { createdAt: _, ...dayData } = record;
      dataMap.set(dateKey, dayData);
    });

    const fullYearData: { date: string; count: number; level: number; data: DayCounts | undefined }[] = [];
    const currentDate = new Date(startOfYear);

    while (currentDate <= endOfYear) {
      const dateKey = currentDate.toISOString().split("T")[0]!;
      const existingData = dataMap.get(dateKey);

      if (existingData) {
        const typeCounts = [
          { type: "roma" as const, count: existingData.romaTypeCount },
          { type: "kana" as const, count: existingData.kanaTypeCount },
          {
            type: "other" as const,
            count: existingData.flickTypeCount + existingData.englishTypeCount + existingData.otherTypeCount,
          },
          { type: "ime" as const, count: existingData.imeTypeCount },
        ];

        const dominantType = typeCounts.reduce(
          (max, current) => (current.count > max.count ? current : max),
          typeCounts[0]!,
        );
        const totalTypeCount = Object.values(existingData).reduce((total, count) => total + count, 0);
        const level = getActivityLevel({ type: dominantType.type, totalTypeCount });

        fullYearData.push({
          date: dateKey,
          count: totalTypeCount,
          level,
          data: existingData,
        });
      } else {
        fullYearData.push({ date: dateKey, count: 0, level: 0, data: undefined });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return fullYearData;
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
