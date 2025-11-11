import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { ResultStatuses } from "@/server/drizzle/schema";

const CreateTypingResultJsonSchema = z.array(
  z.object({
    status: z.object({
      p: z.number().optional(),
      tBonus: z.number().optional(),
      lType: z.number().optional(),
      lMiss: z.number().optional(),
      lRkpm: z.number().or(z.literal(Infinity)).optional(),
      lKpm: z.number().optional(),
      lostW: z.string().nullable().optional(),
      lLost: z.number().optional(),
      combo: z.number(),
      tTime: z.number(),
      mode: z.enum(["roma", "kana", "flick"]),
      sp: z.number(),
    }),
    types: z.array(
      z.object({
        is: z.boolean().optional(),
        c: z.string().optional(),
        op: z.string().optional(),
        t: z.number(),
      }),
    ),
  }),
);
export const CreateResultStatusSchema = createInsertSchema(ResultStatuses).omit({ resultId: true }).required();

export const CreateResultSchema = z
  .object({
    mapId: z.number(),
    status: CreateResultStatusSchema.required(),
    lineResults: CreateTypingResultJsonSchema,
  })
  .refine(() => true, { error: "リザルトデータの形式が無効です" });

export type ResultData = z.output<typeof CreateTypingResultJsonSchema>;
export type TypeResult = ResultData[number]["types"][number];
export type LineResultStatus = ResultData[number]["status"];

export const RESULT_INPUT_METHOD_TYPES = ["roma", "kana", "romakana", "english"] as const;
export const RESULT_PLAY_SPEEDS = [1, 1.25, 1.5, 1.75, 2];
export const KPM_LIMIT = { min: 0, max: 1200 };
export const CLEAR_RATE_LIMIT = { min: 0, max: 100 };
export const PLAY_SPEED_LIMIT = { min: 1, max: 2 };

const ResultListSearchParamsSchema = {
  mode: z.literal(RESULT_INPUT_METHOD_TYPES).nullable(),
  minKpm: z.number().default(KPM_LIMIT.min),
  maxKpm: z.number().default(KPM_LIMIT.max),
  minClearRate: z.number().default(CLEAR_RATE_LIMIT.min),
  maxClearRate: z.number().default(CLEAR_RATE_LIMIT.max),
  minPlaySpeed: z.literal(RESULT_PLAY_SPEEDS).default(PLAY_SPEED_LIMIT.min),
  maxPlaySpeed: z.literal(RESULT_PLAY_SPEEDS).default(PLAY_SPEED_LIMIT.max),
  username: z.string().default(""),
  mapKeyword: z.string().default(""),
};

export const SelectResultListApiSchema = z
  .object({ cursor: z.string().nullable().optional() })
  .extend(ResultListSearchParamsSchema);
export const SelectResultListByPlayerIdApiSchema = z.object({
  playerId: z.number(),
  cursor: z.string().nullable().optional(),
});
