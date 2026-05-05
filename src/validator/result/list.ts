import z from "zod/v4";

export const RESULT_INPUT_METHOD_TYPES = ["roma", "kana", "romakana", "english"] as const;
export const RESULT_PLAY_SPEEDS = [1, 1.25, 1.5, 1.75, 2];
export const KPM_LIMIT = { min: 0, max: 1200 };
export const CLEAR_RATE_LIMIT = { min: 0, max: 100 };
export const PLAY_SPEED_LIMIT = { min: 1, max: 2 };

export const ResultListFilterSchema = z.object({
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

export const ResultListSortSchema = z.object({});

export const SelectResultListApiSchema = z
  .object({ cursor: z.number().optional() })
  .extend(ResultListFilterSchema.shape);
