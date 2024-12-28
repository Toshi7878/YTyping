import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userOptionRouter = {
  getUserTypingOptions: publicProcedure.query(async () => {
    const session = await auth();
    const userId = session?.user ? Number(session?.user.id) : 0;

    const userTypingOptions = await db.typingOption.findUnique({
      where: { userId },
      select: {
        timeOffset: true,
        typeSound: true,
        missSound: true,
        lineClearSound: true,
        nextDisplay: true,
        timeOffsetKey: true,
        toggleInputModeKey: true,
      }, // 全てのカラムを取得するためにselectをnullに設定
    });

    return userTypingOptions;
  }),
  update: publicProcedure
    .input(
      z.object({
        timeOffset: z.number(),
        typeSound: z.boolean(),
        missSound: z.boolean(),
        lineClearSound: z.boolean(),
        nextDisplay: z.string(),
        timeOffsetKey: z.string(),
        toggleInputModeKey: z.string(),
      }),
    )
    .mutation(async ({ input }) => {
      const session = await auth();

      try {
        const userId = session ? Number(session.user.id) : 0;

        const updated = await db.typingOption.upsert({
          where: {
            userId,
          },
          update: {
            ...input,
          },
          create: {
            userId,
            ...input,
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
