import z from "zod";

export const IncrementTypingCountStatsSchema = z.object({
  romaType: z.number().int().min(0),
  kanaType: z.number().int().min(0),
  flickType: z.number().int().min(0),
  englishType: z.number().int().min(0),
  spaceType: z.number().int().min(0),
  symbolType: z.number().int().min(0),
  numType: z.number().int().min(0),
  typingTime: z.number().min(0),
  maxCombo: z.number().int().min(0),
  timezone: z.string(),
});

export const IncrementImeTypeCountStatsSchema = z.object({
  typingTime: z.number().min(0),
  imeTypeCount: z.number().min(0),
  timezone: z.string(),
});
