import { line_completed_display, next_display, time_offset_key, toggle_input_mode_key } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userTypingOptionRouter = {
  getUserTypingOptions: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    if (!user.id) {
      return;
    }

    const userTypingOptions = await db.user_typing_options.findUnique({
      where: { user_id: user.id },
      select: {
        time_offset: true,
        kana_word_scroll: true,
        roma_word_scroll: true,
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
  update: protectedProcedure
    .input(
      z.object({
        time_offset: z.number(),
        kana_word_scroll: z.number(),
        roma_word_scroll: z.number(),
        type_sound: z.boolean(),
        miss_sound: z.boolean(),
        line_clear_sound: z.boolean(),
        line_completed_display: z.nativeEnum(line_completed_display),
        next_display: z.nativeEnum(next_display),
        time_offset_key: z.nativeEnum(time_offset_key),
        toggle_input_mode_key: z.nativeEnum(toggle_input_mode_key),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;

      const updated = await db.user_typing_options.upsert({
        where: {
          user_id: user.id,
        },
        update: {
          ...input,
        },
        create: {
          user_id: user.id,
          ...input,
        },
      });

      return updated;
    }),
};
