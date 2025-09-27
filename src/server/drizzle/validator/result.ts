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
