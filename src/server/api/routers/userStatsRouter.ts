import { z } from "@/validator/z";
import axios from "axios";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userStatsRouter = {
  incrementPlayCountStats: publicProcedure
    .input(
      z.object({
        mapId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { mapId } = input;
      if (user.id) {
        await db.user_stats.upsert({
          where: {
            user_id: user.id,
          },
          update: {
            total_play_count: { increment: 1 },
          },
          create: {
            user_id: user.id,
            total_play_count: 1,
          },
        });
      }

      await db.maps.update({
        where: {
          id: mapId,
        },
        data: {
          play_count: { increment: 1 },
        },
      });
    }),

  incrementImeStats: protectedProcedure
    .input(
      z.object({
        ime_type: z.number(),
        total_type_time: z.number(),
      })
    )
    .mutation(async ({ input: sendStats, ctx }) => {
      const { user } = ctx;

      if (!user.id) {
        return;
      }

      axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-ime-typing-stats`,
        JSON.stringify({ ...sendStats, userId: user.id })
      );
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
      })
    )
    .mutation(async ({ input: sendStats, ctx }) => {
      const { user } = ctx;

      if (!user.id) {
        return;
      }

      axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/update-user-typing-stats`,
        JSON.stringify({ ...sendStats, userId: user.id })
      );
    }),

  getUserStats: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const userTypingOptions = await db.user_stats.findUnique({
        where: { user_id: input.userId },
        select: {
          total_ranking_count: true,
          total_typing_time: true,
          roma_type_total_count: true,
          kana_type_total_count: true,
          flick_type_total_count: true,
          english_type_total_count: true,
          symbol_type_total_count: true,
          num_type_total_count: true,
          space_type_total_count: true,
          ime_type_total_count: true,
          total_play_count: true,
          max_combo: true,
          created_at: true,
        },
      });

      return userTypingOptions;
    }),

  getUserActivity: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const userTypingOptions = await db.user_daily_type_counts.findMany({
        where: {
          user_id: input.userId,
          created_at: {
            gte: oneYearAgo,
          },
        },
        select: {
          created_at: true,
          roma_type_count: true,
          kana_type_count: true,
          flick_type_count: true,
          english_type_count: true,
          other_type_count: true,
          ime_type_count: true,
        },
        orderBy: {
          created_at: "asc",
        },
      });

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
          typeCounts[0]
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

export const LEVELS = {
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
