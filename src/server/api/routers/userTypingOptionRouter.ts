import { z } from "@/validator/z";
import { line_completed_display, next_display, time_offset_key, toggle_input_mode_key } from "@prisma/client";
import { protectedProcedure, publicProcedure } from "../trpc";

const typingOptionSchema = z.object({
  time_offset: z.number(),
  kana_word_scroll: z.number(),
  roma_word_scroll: z.number(),
  kana_word_font_size: z.number(),
  roma_word_font_size: z.number(),
  type_sound: z.boolean(),
  miss_sound: z.boolean(),
  line_clear_sound: z.boolean(),
  line_completed_display: z.nativeEnum(line_completed_display),
  next_display: z.nativeEnum(next_display),
  time_offset_key: z.nativeEnum(time_offset_key),
  toggle_input_mode_key: z.nativeEnum(toggle_input_mode_key),
});

export const userTypingOptionRouter = {
  getUserTypingOptions: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const userTypingOptions = await db.user_typing_options.findUnique({
      where: { user_id: user.id },
    });

    if (userTypingOptions) {
      const { user_id, ...typingOptionsWithoutUserId } = userTypingOptions;
      return typingOptionsWithoutUserId;
    }

    return null;
  }),
  update: protectedProcedure.input(typingOptionSchema).mutation(async ({ input, ctx }) => {
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
