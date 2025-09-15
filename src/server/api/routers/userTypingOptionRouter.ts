import { schema } from "@/server/drizzle/client";
import { eq } from "drizzle-orm";
import z from "zod";
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
        time_offset: schema.UserTypingOptions.timeOffset,
        kana_word_scroll: schema.UserTypingOptions.kanaWordScroll,
        roma_word_scroll: schema.UserTypingOptions.romaWordScroll,
        kana_word_font_size: schema.UserTypingOptions.kanaWordFontSize,
        roma_word_font_size: schema.UserTypingOptions.romaWordFontSize,
        kana_word_spacing: schema.UserTypingOptions.kanaWordSpacing,
        roma_word_spacing: schema.UserTypingOptions.romaWordSpacing,
        type_sound: schema.UserTypingOptions.typeSound,
        miss_sound: schema.UserTypingOptions.missSound,
        line_clear_sound: schema.UserTypingOptions.lineClearSound,
        line_completed_display: schema.UserTypingOptions.lineCompletedDisplay,
        next_display: schema.UserTypingOptions.nextDisplay,
        time_offset_key: schema.UserTypingOptions.timeOffsetKey,
        toggle_input_mode_key: schema.UserTypingOptions.toggleInputModeKey,
        main_word_display: schema.UserTypingOptions.mainWordDisplay,
      })
      .from(schema.UserTypingOptions)
      .where(eq(schema.UserTypingOptions.userId, user.id))
      .limit(1);

    return rows[0] ?? null;
  }),
  getUserImeTypingOptions: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    const rows = await db
      .select({
        enable_add_symbol: schema.UserImeTypingOptions.enableAddSymbol,
        enable_eng_space: schema.UserImeTypingOptions.enableEngSpace,
        enable_eng_upper_case: schema.UserImeTypingOptions.enableEngUpperCase,
        add_symbol_list: schema.UserImeTypingOptions.addSymbolList,
        enable_next_lyrics: schema.UserImeTypingOptions.enableNextLyrics,
        enable_large_video_display: schema.UserImeTypingOptions.enableLargeVideoDisplay,
      })
      .from(schema.UserImeTypingOptions)
      .where(eq(schema.UserImeTypingOptions.userId, user.id))
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
      .insert(schema.UserTypingOptions)
      .values(values)
      .onConflictDoUpdate({ target: [schema.UserTypingOptions.userId], set: { ...values } })
      .returning({
        time_offset: schema.UserTypingOptions.timeOffset,
        kana_word_scroll: schema.UserTypingOptions.kanaWordScroll,
        roma_word_scroll: schema.UserTypingOptions.romaWordScroll,
        kana_word_font_size: schema.UserTypingOptions.kanaWordFontSize,
        roma_word_font_size: schema.UserTypingOptions.romaWordFontSize,
        kana_word_spacing: schema.UserTypingOptions.kanaWordSpacing,
        roma_word_spacing: schema.UserTypingOptions.romaWordSpacing,
        type_sound: schema.UserTypingOptions.typeSound,
        miss_sound: schema.UserTypingOptions.missSound,
        line_clear_sound: schema.UserTypingOptions.lineClearSound,
        line_completed_display: schema.UserTypingOptions.lineCompletedDisplay,
        next_display: schema.UserTypingOptions.nextDisplay,
        time_offset_key: schema.UserTypingOptions.timeOffsetKey,
        toggle_input_mode_key: schema.UserTypingOptions.toggleInputModeKey,
        main_word_display: schema.UserTypingOptions.mainWordDisplay,
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
      .insert(schema.UserImeTypingOptions)
      .values(values)
      .onConflictDoUpdate({ target: [schema.UserImeTypingOptions.userId], set: { ...values } })
      .returning({
        enable_add_symbol: schema.UserImeTypingOptions.enableAddSymbol,
        enable_eng_space: schema.UserImeTypingOptions.enableEngSpace,
        enable_eng_upper_case: schema.UserImeTypingOptions.enableEngUpperCase,
        add_symbol_list: schema.UserImeTypingOptions.addSymbolList,
        enable_next_lyrics: schema.UserImeTypingOptions.enableNextLyrics,
        enable_large_video_display: schema.UserImeTypingOptions.enableLargeVideoDisplay,
      });

    return res[0] ?? null;
  }),
};
