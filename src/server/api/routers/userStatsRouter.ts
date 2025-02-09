import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userStatsRouter = {
  incrementPlayCountStats: publicProcedure
    .input(
      z.object({
        mapId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { mapId } = input;
      const session = await auth();
      const userId = session ? Number(session.user.id) : 0;

      await prisma.user_stats.upsert({
        where: {
          user_id: userId,
        },
        update: {
          total_play_count: { increment: 1 },
        },
        create: {
          user_id: userId,
          total_typing_time: 1,
        },
      });

      await prisma.maps.update({
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
        typingTime: z.number(),
        englishType: z.number(),
        numType: z.number(),
        symbolType: z.number(),
        spaceType: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const session = await auth();
        const userId = session ? Number(session.user.id) : 0;

        await prisma.user_stats.upsert({
          where: {
            user_id: userId,
          },
          update: {
            roma_type_total_count: { increment: input.romaType },
            kana_type_total_count: { increment: input.kanaType },
            flick_type_total_count: { increment: input.flickType },
            english_type_total_count: { increment: input.englishType },
            num_type_total_count: { increment: input.numType },
            symbol_type_total_count: { increment: input.symbolType },
            space_type_total_count: { increment: input.spaceType },
            total_typing_time: { increment: input.typingTime },
          },
          create: {
            user_id: userId,
            roma_type_total_count: input.romaType,
            kana_type_total_count: input.kanaType,
            flick_type_total_count: input.flickType,
            english_type_total_count: input.englishType,
            num_type_total_count: input.numType,
            symbol_type_total_count: input.symbolType,
            space_type_total_count: input.spaceType,
            total_typing_time: input.typingTime,
          },
        });
      } catch (error) {
        return new Response(
          JSON.stringify({
            id: null,
            title: "サーバー側で問題が発生しました",
            message: "しばらく時間をおいてから再度お試しください。",
            status: 500,
            errorObject: error instanceof Error ? error.message : String(error),
          }),
          { status: 500 }
        );
      }
    }),
};
