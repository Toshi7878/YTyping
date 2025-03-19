import axios from "axios";
import { z } from "zod";
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
      const { db, user } = ctx;

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
};
