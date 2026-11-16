import z from "zod";
import { en, ja } from "zod/locales";
import { getCurrentLocale, translate } from "@/i18n/translate";
import { STRING_SHORT_LENGTH } from "@/server/drizzle/const";

// zod の既定メッセージは、その時点の表示言語に合わせる
const jaLocaleError = ja().localeError;
const enLocaleError = en().localeError;
z.config({ localeError: (issue) => (getCurrentLocale() === "en" ? enLocaleError(issue) : jaLocaleError(issue)) });

export const UserNameSchema = z.object({
  newName: z
    .string()
    .min(1)
    .max(15)
    .refine((val) => !/^[\s\u200B\u3000\t]+|[\s\u200B\u3000\t]+$/.test(val), {
      error: () => translate("validation.userNameSpaces"),
    })
    .refine((val) => !/[\u200B]/.test(val), { error: () => translate("validation.userNameZeroWidth") }),
});

const FingerChartUrlBaseSchema = z
  .string()
  .max(100)
  .refine((val) => val === "" || /^http?:\/\/unsi\.nonip\.net\/user\/[0-9]+$/.test(val), {
    error: () => translate("validation.fingerChartUrl"),
  });
export const FingerChartUrlFormSchema = z.object({ url: FingerChartUrlBaseSchema });
export const FingerChartUrlApiSchema = FingerChartUrlBaseSchema;

const keyboardBaseSchema = z.string().max(STRING_SHORT_LENGTH);
export const keyboardFormSchema = z.object({ keyboard: keyboardBaseSchema });
export const keyboardApiSchema = keyboardBaseSchema;
