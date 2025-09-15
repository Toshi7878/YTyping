import { schema } from "@/server/drizzle/client";
import { getBaseUrl } from "@/utils/getBaseUrl";
import axios from "axios";
import { and, asc, eq, gte, sql } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userStatsRouter = {
  incrementPlayCountStats: publicProcedure
    .input(
      z.object({
        mapId: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { mapId } = input;
      if (user.id) {
        await db
          .insert(schema.UserStats)
          .values({ userId: user.id, totalPlayCount: 1 })
          .onConflictDoUpdate({
            target: [schema.UserStats.userId],
            set: { totalPlayCount: sql`${schema.UserStats.totalPlayCount} + 1` },
          });
      }

      await db
        .update(schema.Maps)
        .set({ playCount: sql`${schema.Maps.playCount} + 1` })
        .where(eq(schema.Maps.id, mapId));
    }),

  incrementImeStats: protectedProcedure
    .input(
      z.object({
        ime_type: z.number(),
        total_type_time: z.number(),
      }),
    )
    .mutation(async ({ input: sendStats, ctx }) => {
      const { user } = ctx;

      if (!user.id) {
        return;
      }

      axios.post(`${getBaseUrl()}/api/update-user-ime-typing-stats`, JSON.stringify({ ...sendStats, userId: user.id }));
    }),

  incrementTypingStats: protectedProcedure
    .input(
      z.object({
        romaType: z.number(),
        kanaType: z.number(),
        flickType: z.number(),
        totalTypeTime: z.number(),
        englishType: z.number(),
        numType: z.number(),
        symbolType: z.number(),
        spaceType: z.number(),
        maxCombo: z.number(),
      }),
    )
    .mutation(async ({ input: sendStats, ctx }) => {
      const { user } = ctx;

      if (!user.id) {
        return;
      }

      axios.post(`${getBaseUrl()}/api/update-user-typing-stats`, JSON.stringify({ ...sendStats, userId: user.id }));
    }),

  getUserStats: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const rows = await db
        .select({
          total_ranking_count: schema.UserStats.totalRankingCount,
          total_typing_time: schema.UserStats.totalTypingTime,
          roma_type_total_count: schema.UserStats.romaTypeTotalCount,
          kana_type_total_count: schema.UserStats.kanaTypeTotalCount,
          flick_type_total_count: schema.UserStats.flickTypeTotalCount,
          english_type_total_count: schema.UserStats.englishTypeTotalCount,
          symbol_type_total_count: schema.UserStats.symbolTypeTotalCount,
          num_type_total_count: schema.UserStats.numTypeTotalCount,
          space_type_total_count: schema.UserStats.spaceTypeTotalCount,
          ime_type_total_count: schema.UserStats.imeTypeTotalCount,
          total_play_count: schema.UserStats.totalPlayCount,
          max_combo: schema.UserStats.maxCombo,
          created_at: schema.UserStats.createdAt,
        })
        .from(schema.UserStats)
        .where(eq(schema.UserStats.userId, input.userId))
        .limit(1);

      return rows[0] ?? null;
    }),

  getUserActivity: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const userTypingOptions = await db
        .select({
          created_at: schema.UserDailyTypeCounts.createdAt,
          roma_type_count: schema.UserDailyTypeCounts.romaTypeCount,
          kana_type_count: schema.UserDailyTypeCounts.kanaTypeCount,
          flick_type_count: schema.UserDailyTypeCounts.flickTypeCount,
          english_type_count: schema.UserDailyTypeCounts.englishTypeCount,
          other_type_count: schema.UserDailyTypeCounts.otherTypeCount,
          ime_type_count: schema.UserDailyTypeCounts.imeTypeCount,
        })
        .from(schema.UserDailyTypeCounts)
        .where(
          and(
            eq(schema.UserDailyTypeCounts.userId, input.userId),
            gte(schema.UserDailyTypeCounts.createdAt, oneYearAgo),
          ),
        )
        .orderBy(asc(schema.UserDailyTypeCounts.createdAt));

      const dailyTotals: {
        date: string;
        count: number;
        level: number;
        data: (typeof userTypingOptions)[number] | undefined;
      }[] = userTypingOptions.map((day) => {
        const {
          roma_type_count,
          kana_type_count,
          flick_type_count,
          english_type_count,
          other_type_count,
          ime_type_count,
        } = day;

        const typeCounts = [
          { type: "roma" as const, count: roma_type_count },
          { type: "kana" as const, count: kana_type_count },
          { type: "other" as const, count: flick_type_count + english_type_count + other_type_count },
          { type: "ime" as const, count: ime_type_count },
        ];

        const dominantType = typeCounts.reduce(
          (max, current) => (current.count > max.count ? current : max),
          typeCounts[0],
        );

        const totalTypeCount =
          roma_type_count + kana_type_count + flick_type_count + english_type_count + other_type_count + ime_type_count;
        const level = getActivityLevel({ type: dominantType.type, totalTypeCount });

        const dateObj = new Date(day.created_at);
        const formattedDate = dateObj.toISOString().split("T")[0];

        return {
          date: formattedDate,
          count: totalTypeCount,
          level,
          data: day,
        };
      });

      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      if (!dailyTotals.length || startOfYear !== new Date(dailyTotals[0].date)) {
        dailyTotals.unshift({
          date: startOfYear.toISOString().split("T")[0],
          count: 0,
          level: 0,
          data: undefined,
        });
      }

      const endOfYear = new Date(currentYear, 11, 31);
      if (!dailyTotals.length || endOfYear !== new Date(dailyTotals[dailyTotals.length - 1].date)) {
        dailyTotals.push({
          date: endOfYear.toISOString().split("T")[0],
          count: 0,
          level: 0,
          data: undefined,
        });
      }

      return dailyTotals;
    }),
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

const getActivityLevel = ({ type, totalTypeCount }: { type: keyof typeof LEVELS; totalTypeCount: number }): number => {
  const sortedLevels = Object.entries(LEVELS[type])
    .map(([level, threshold]) => ({ level: parseInt(level), threshold }))
    .sort((a, b) => b.level - a.level);

  for (const { level, threshold } of sortedLevels) {
    if (totalTypeCount >= threshold) {
      return level;
    }
  }

  return 0;
};
