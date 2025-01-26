import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userTypingStatsRouter = {
  upsert: publicProcedure
    .input(
      z.object({
        romaType: z.number(),
        kanaType: z.number(),
        typingTime: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const session = await auth();

      const { romaType, kanaType, typingTime } = input;
      try {
        const userId = session ? Number(session.user.id) : 0;
        const stats = await prisma.user_typing_stats.findUnique({
          where: {
            user_id: userId,
          },
        });

        const updated = await prisma.user_typing_stats.upsert({
          where: {
            user_id: userId,
          },
          update: {
            roma_type_total_count: (stats ? stats.roma_type_total_count : 0) + romaType,
            kana_type_total_count: (stats ? stats.kana_type_total_count : 0) + kanaType,
            total_typing_time: (stats ? stats.total_typing_time : 0) + typingTime,
          },
          create: {
            user_id: userId,
            roma_type_total_count: romaType,
            kana_type_total_count: kanaType,
            total_typing_time: typingTime,
          },
        });

        return updated;
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
