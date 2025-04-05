import { z } from "@/validator/z";
import axios from "axios";
import { publicProcedure } from "../trpc";

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

  incrementTypingStats: publicProcedure
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
        },
        orderBy: {
          created_at: "asc",
        },
      });

      // 日付ごとの合計タイプ数を計算
      const dailyTotals = userTypingOptions.map((day) => {
        const romaCount = day.roma_type_count || 0;
        const kanaCount = day.kana_type_count || 0;
        const flickCount = day.flick_type_count || 0;
        const englishCount = day.english_type_count || 0;
        const otherCount = day.other_type_count || 0;

        const count = romaCount + kanaCount + flickCount + englishCount + otherCount;

        // 最も多いタイプを特定
        const typeCounts = [
          { type: "roma", count: romaCount },
          { type: "kana", count: kanaCount },
          { type: "flick", count: flickCount },
          { type: "english", count: englishCount },
          { type: "other", count: otherCount },
        ];

        const dominantType = typeCounts.reduce(
          (max, current) => (current.count > max.count ? current : max),
          typeCounts[0]
        );

        // タイプに基づいてレベルを決定
        let level = 0;
        if (count > 0) {
          if (dominantType.type === "roma") {
            if (count >= 15000) level = 3;
            else if (count >= 5000) level = 2;
            else if (count >= 1) level = 1;
          } else if (dominantType.type === "kana") {
            if (count >= 12000) level = 6;
            else if (count >= 5000) level = 5;
            else if (count >= 1) level = 4;
          } else {
            if (count >= 15000) level = 9;
            else if (count >= 5000) level = 8;
            else if (count >= 1) level = 7;
          }
        }

        // 日付を'YYYY-MM-DD'形式に変換
        const dateObj = new Date(day.created_at);
        const formattedDate = dateObj.toISOString().split("T")[0];

        return {
          date: formattedDate,
          count,
          level,
          dominantType: dominantType.type,
        };
      });

      const currentYear = new Date().getFullYear();
      const startOfYear = new Date(currentYear, 0, 1);
      if (!dailyTotals.length || startOfYear !== new Date(dailyTotals[0].date)) {
        dailyTotals.unshift({
          date: startOfYear.toISOString().split("T")[0],
          count: 0,
          level: 0,
          dominantType: "",
        });
      }

      const endOfYear = new Date(currentYear, 11, 31);
      if (!dailyTotals.length || endOfYear !== new Date(dailyTotals[dailyTotals.length - 1].date)) {
        dailyTotals.push({
          date: endOfYear.toISOString().split("T")[0],
          count: 0,
          level: 0,
          dominantType: "",
        });
      }

      return dailyTotals;
    }),
};
