import z from "zod/v4";

export const resultReportApiSchema = z.object({
  resultId: z.number(),
  reasonDetail: z.string().trim().min(1).max(500, "500文字以内で入力してください"),
});
