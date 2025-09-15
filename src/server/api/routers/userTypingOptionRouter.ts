import z from "zod";
import { eq } from "drizzle-orm";
import { schema } from "@/server/drizzle/client";
import { protectedProcedure, publicProcedure } from "../trpc";

const typingOptionSchema = z.object({
  time_offset: z.number(),
  kana_word_scroll: z.number(),
  roma_word_scroll: z.number(),
  kana_word_font_size: z.number(),
  roma_word_font_size: z.number(),
  kana_word_spacing: z.number(),
  roma_word_spacing: z.number(),
  type_sound: z.boolean(),
  miss_sound: z.boolean(),
  line_clear_sound: z.boolean(),
  line_completed_display: z.enum(schema.lineCompletedDisplayEnum.enumValues),
  next_display: z.enum(schema.nextDisplayEnum.enumValues),
  time_offset_key: z.enum(schema.timeOffsetKeyEnum.enumValues),
  toggle_input_mode_key: z.enum(schema.toggleInputModeKeyEnum.enumValues),
  main_word_display: z.enum(schema.mainWordDisplayEnum.enumValues),
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

    const rows = await db
      .select({
        time_offset: schema.userTypingOptions.timeOffset,
        kana_word_scroll: schema.userTypingOptions.kanaWordScroll,
        roma_word_scroll: schema.userTypingOptions.romaWordScroll,
        kana_word_font_size: schema.userTypingOptions.kanaWordFontSize,
        roma_word_font_size: schema.userTypingOptions.romaWordFontSize,
        kana_word_spacing: schema.userTypingOptions.kanaWordSpacing,
        roma_word_spacing: schema.userTypingOptions.romaWordSpacing,
        type_sound: schema.userTypingOptions.typeSound,
        miss_sound: schema.userTypingOptions.missSound,
        line_clear_sound: schema.userTypingOptions.lineClearSound,
        line_completed_display: schema.userTypingOptions.lineCompletedDisplay,
        next_display: schema.userTypingOptions.nextDisplay,
        time_offset_key: schema.userTypingOptions.timeOffsetKey,
        toggle_input_mode_key: schema.userTypingOptions.toggleInputModeKey,
        main_word_display: schema.userTypingOptions.mainWordDisplay,
      })
      .from(schema.userTypingOptions)
      .where(eq(schema.userTypingOptions.userId, user.id))
      .limit(1);

    return rows[0] ?? null;
  }),
  getUserImeTypingOptions: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const rows = await db
      .select({
        enable_add_symbol: schema.userImeTypingOptions.enableAddSymbol,
        enable_eng_space: schema.userImeTypingOptions.enableEngSpace,
        enable_eng_upper_case: schema.userImeTypingOptions.enableEngUpperCase,
        add_symbol_list: schema.userImeTypingOptions.addSymbolList,
        enable_next_lyrics: schema.userImeTypingOptions.enableNextLyrics,
        enable_large_video_display: schema.userImeTypingOptions.enableLargeVideoDisplay,
      })
      .from(schema.userImeTypingOptions)
      .where(eq(schema.userImeTypingOptions.userId, user.id))
      .limit(1);

    return rows[0] ?? null;
  }),
  updateTypeOptions: protectedProcedure.input(typingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const values = {
      userId: user.id,
      timeOffset: input.time_offset,
      kanaWordScroll: input.kana_word_scroll,
      romaWordScroll: input.roma_word_scroll,
      kanaWordFontSize: input.kana_word_font_size,
      romaWordFontSize: input.roma_word_font_size,
      kanaWordSpacing: input.kana_word_spacing,
      romaWordSpacing: input.roma_word_spacing,
      typeSound: input.type_sound,
      missSound: input.miss_sound,
      lineClearSound: input.line_clear_sound,
      lineCompletedDisplay: input.line_completed_display,
      nextDisplay: input.next_display,
      timeOffsetKey: input.time_offset_key,
      toggleInputModeKey: input.toggle_input_mode_key,
      mainWordDisplay: input.main_word_display,
    } as const;

    const res = await db
      .insert(schema.userTypingOptions)
      .values(values)
      .onConflictDoUpdate({ target: [schema.userTypingOptions.userId], set: { ...values } })
      .returning({
        time_offset: schema.userTypingOptions.timeOffset,
        kana_word_scroll: schema.userTypingOptions.kanaWordScroll,
        roma_word_scroll: schema.userTypingOptions.romaWordScroll,
        kana_word_font_size: schema.userTypingOptions.kanaWordFontSize,
        roma_word_font_size: schema.userTypingOptions.romaWordFontSize,
        kana_word_spacing: schema.userTypingOptions.kanaWordSpacing,
        roma_word_spacing: schema.userTypingOptions.romaWordSpacing,
        type_sound: schema.userTypingOptions.typeSound,
        miss_sound: schema.userTypingOptions.missSound,
        line_clear_sound: schema.userTypingOptions.lineClearSound,
        line_completed_display: schema.userTypingOptions.lineCompletedDisplay,
        next_display: schema.userTypingOptions.nextDisplay,
        time_offset_key: schema.userTypingOptions.timeOffsetKey,
        toggle_input_mode_key: schema.userTypingOptions.toggleInputModeKey,
        main_word_display: schema.userTypingOptions.mainWordDisplay,
      });

    return res[0] ?? null;
  }),

  updateImeTypeOptions: protectedProcedure.input(imeTypingOptionsSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const values = {
      userId: user.id,
      enableAddSymbol: input.enable_add_symbol,
      enableEngSpace: input.enable_eng_space,
      enableEngUpperCase: input.enable_eng_upper_case,
      addSymbolList: input.add_symbol_list,
      enableNextLyrics: input.enable_next_lyrics,
      enableLargeVideoDisplay: input.enable_large_video_display,
    } as const;

    const res = await db
      .insert(schema.userImeTypingOptions)
      .values(values)
      .onConflictDoUpdate({ target: [schema.userImeTypingOptions.userId], set: { ...values } })
      .returning({
        enable_add_symbol: schema.userImeTypingOptions.enableAddSymbol,
        enable_eng_space: schema.userImeTypingOptions.enableEngSpace,
        enable_eng_upper_case: schema.userImeTypingOptions.enableEngUpperCase,
        add_symbol_list: schema.userImeTypingOptions.addSymbolList,
        enable_next_lyrics: schema.userImeTypingOptions.enableNextLyrics,
        enable_large_video_display: schema.userImeTypingOptions.enableLargeVideoDisplay,
      });

    return res[0] ?? null;
  }),
};
