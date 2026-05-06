import { createInsertSchema } from "drizzle-orm/zod";
import z from "zod";
import { resultStatuses } from "@/server/drizzle/schema";

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

const CreateResultStatusSchema = createInsertSchema(resultStatuses)
  .pick({
    rkpm: true,
    kpm: true,
    score: true,
    minPlaySpeed: true,
    kanaToRomaKpm: true,
    kanaToRomaRkpm: true,
    romaType: true,
    kanaType: true,
    flickType: true,
    englishType: true,
    spaceType: true,
    symbolType: true,
    numType: true,
    miss: true,
    lost: true,
    maxCombo: true,
    clearRate: true,
    isCaseSensitive: true,
  })
  .required();

export const CreateResultSchema = z
  .object({
    mapId: z.number(),
    status: CreateResultStatusSchema,
    lineResults: CreateTypingResultJsonSchema,
  })
  .refine(() => true, { error: "リザルトデータの形式が無効です" });

export type TypingLineResult = z.output<typeof CreateTypingResultJsonSchema>[number];
export type TypeResult = TypingLineResult["types"][number];
