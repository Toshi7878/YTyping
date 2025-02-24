import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import {
  line_completed_display,
  next_display,
  time_offset_key,
  toggle_input_mode_key,
} from "@prisma/client";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userTypingOptionRouter = {
  getUserTypingOptions: publicProcedure.query(async () => {
    const session = await auth();
    const userId = session?.user ? Number(session?.user.id) : 0;

    const userTypingOptions = await prisma.user_typing_options.findUnique({
      where: { user_id: userId },
      select: {
        time_offset: true,
        type_sound: true,
        miss_sound: true,
        line_clear_sound: true,
        line_completed_display: true,
        next_display: true,
        time_offset_key: true,
        toggle_input_mode_key: true,
      },
    });

    return userTypingOptions;
  }),
  update: publicProcedure
    .input(
      z.object({
        time_offset: z.number(),
        type_sound: z.boolean(),
        miss_sound: z.boolean(),
        line_clear_sound: z.boolean(),
        line_completed_display: z.nativeEnum(line_completed_display),
        next_display: z.nativeEnum(next_display),
        time_offset_key: z.nativeEnum(time_offset_key),
        toggle_input_mode_key: z.nativeEnum(toggle_input_mode_key),
      })
    )
    .mutation(async ({ input }) => {
      const session = await auth();

      try {
        const userId = session ? Number(session.user.id) : 0;

        const updated = await prisma.user_typing_options.upsert({
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
