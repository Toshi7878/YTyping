import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { custom_user_active_state } from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userOptionRouter = {
  getUserOptions: publicProcedure.query(async () => {
    const session = await auth();
    const userId = session?.user ? Number(session?.user.id) : 0;

    const userOptions = await prisma.user_options.findUnique({
      where: { user_id: userId },
      select: { custom_user_active_state: true },
    });

    return userOptions;
  }),

  update: publicProcedure
    .input(
      z.object({
        custom_user_active_state: z.nativeEnum(custom_user_active_state),
      })
    )
    .mutation(async ({ input }) => {
      const session = await auth();

      try {
        const userId = session ? Number(session.user.id) : 0;

        const updated = await prisma.user_options.upsert({
          where: {
            user_id: userId,
          },
          update: {
            ...input,
          },
          create: {
            user_id: userId,
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
          { status: 500 }
        );
      }
    }),
};
