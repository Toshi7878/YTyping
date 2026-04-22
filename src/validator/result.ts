import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { ResultStatuses } from "@/server/drizzle/schema";

const CreateTypingResultJsonSchema = z.array(
  z.object({
    status: z.object({
      point: z.number().optional(),
      timeBonus: z.number().optional(),
      typeCount: z.number().optional(),
      missCount: z.number().optional(),
      lostCount: z.number().optional(),
      rkpm: z.number().or(z.literal(Infinity)).optional(),
      kpm: z.number().optional(),
      typedHiragana: z.string().nullable().optional(),
      lostHiragana: z.string().nullable().optional(),
      lostWord: z.string().nullable().optional(),
      combo: z.number(),
      typingTime: z.number(),
      mode: z.enum(["roma", "kana", "flick"]),
      speed: z.number(),
    }),
    types: z.array(
      z.object({
        isCorrect: z.boolean().optional(),
        char: z.string().optional(),
        option: z.enum(["roma", "kana", "speedChange"]).optional(),
        time: z.number(),
      }),
    ),
  }),
);
/** pp / starRatingSnapshot はサーバーで map の難易度と同期して算出する */
export const CreateResultStatusSchema = createInsertSchema(ResultStatuses)
  .omit({ resultId: true, pp: true, starRatingSnapshot: true })
  .required();

export const CreateResultSchema = z
  .object({
    mapId: z.number(),
    status: CreateResultStatusSchema.required(),
    lineResults: CreateTypingResultJsonSchema,
  })
  .refine(() => true, { error: "リザルトデータの形式が無効です" });

export type TypingLineResult = z.output<typeof CreateTypingResultJsonSchema>[number];
export type TypeResult = TypingLineResult["types"][number];

export const RESULT_INPUT_METHOD_TYPES = ["roma", "kana", "romakana", "english"] as const;
export const RESULT_PLAY_SPEEDS = [1, 1.25, 1.5, 1.75, 2];
export const KPM_LIMIT = { min: 0, max: 1200 };
export const CLEAR_RATE_LIMIT = { min: 0, max: 100 };
export const PLAY_SPEED_LIMIT = { min: 1, max: 2 };

export const ResultListSearchFilterSchema = z.object({
  mode: z.literal(RESULT_INPUT_METHOD_TYPES).nullish(),
  minKpm: z.number().nullish(),
  maxKpm: z.number().nullish(),
  minClearRate: z.number().nullish(),
  maxClearRate: z.number().nullish(),
  minPlaySpeed: z.literal(RESULT_PLAY_SPEEDS).nullish(),
  maxPlaySpeed: z.literal(RESULT_PLAY_SPEEDS).nullish(),
  username: z.string().nullish(),
  mapKeyword: z.string().nullish(),
  playerId: z.number().nullish(),
});

export const SelectResultListApiSchema = z
  .object({ cursor: z.number().optional() })
  .extend(ResultListSearchFilterSchema.shape);
