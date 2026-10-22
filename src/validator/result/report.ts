import z from "zod/v4";
import { translate } from "@/i18n/translate";

export const resultReportApiSchema = z.object({
  resultId: z.number(),
  reasonDetail: z
    .string()
    .trim()
    .min(1)
    .max(500, { error: () => translate("validation.maxChars500") }),
});
