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
		typingTime: z.number()
      }),
    )
    .mutation(async ({ input }) => {
      const session = await auth();

	  const {romaType, kanaType, typingTime} = input
      try {
        const userId = session ? Number(session.user.id) : 0;
		const stats = await prisma.userTypingStats.findUnique({
			where:{
				userId
			}
		})

        const updated = await prisma.userTypingStats.upsert({
          where: {
            userId,
          },
          update: {
            romaTypeTotalCount: (stats ? stats.romaTypeTotalCount:0) + romaType,
            kanaTypeTotalCount: (stats ? stats.kanaTypeTotalCount:0) + kanaType,
			totalTypingTime: (stats ? stats.totalTypingTime:0) + typingTime
          },
          create: {
            userId,
            romaTypeTotalCount: romaType,
            kanaTypeTotalCount: kanaType,
			totalTypingTime: typingTime
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
          { status: 500 },
        );
      }
    }),
};
