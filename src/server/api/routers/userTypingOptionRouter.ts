import { line_completed_display, next_display, time_offset_key, toggle_input_mode_key } from "@prisma/client";
import z from "zod";
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
  line_completed_display: z.enum(line_completed_display),
  next_display: z.enum(next_display),
  time_offset_key: z.enum(time_offset_key),
  toggle_input_mode_key: z.enum(toggle_input_mode_key),
});

const imeTypingOptionsSchema = z.object({
  enable_add_symbol: z.boolean(),
  enable_eng_space: z.boolean(),
  enable_eng_upper_case: z.boolean(),
  add_symbol_list: z.string().max(255),
  enable_next_lyrics: z.boolean(),
  enable_large_video_display: z.boolean(),
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
  getUserImeTypingOptions: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const ImeTypingOptions = await db.user_ime_typing_options.findUnique({
      where: { user_id: user.id },
    });

    if (ImeTypingOptions) {
      const { user_id, ...typingOptionsWithoutUserId } = ImeTypingOptions;
      return typingOptionsWithoutUserId;
    }

    return null;
  }),
  updateTypeOptions: protectedProcedure.input(typingOptionSchema).mutation(async ({ input, ctx }) => {
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

  updateImeTypeOptions: protectedProcedure.input(imeTypingOptionsSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const updated = await db.user_ime_typing_options.upsert({
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
