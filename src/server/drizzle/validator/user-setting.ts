import z from "zod";
import { ja } from "zod/locales";
import { MAX_SHORT_LENGTH } from "./const";

z.config(ja());

export const UserNameSchema = z.object({
  newName: z
    .string()
    .min(1)
    .max(15)
    .refine((val) => !/^[\s\u200B\u3000\t]+|[\s\u200B\u3000\t]+$/.test(val), {
      error: "文字列の両端にスペースを含めることはできません",
    })
    .refine((val) => !/[\u200B]/.test(val), { error: "ゼロ幅スペースを含めることはできません" }),
});

const FingerChartUrlBaseSchema = z
  .string()
  .max(100)
  .refine((val) => val === "" || /^http?:\/\/unsi\.nonip\.net\/user\/[0-9]+$/.test(val), {
    error: "URLは「http://unsi.nonip.net/user/{id}」形式のURLである必要があります。",
  });
export const FingerChartUrlFormSchema = z.object({ url: FingerChartUrlBaseSchema });
export const FingerChartUrlApiSchema = FingerChartUrlBaseSchema;

const keyboardBaseSchema = z.string().max(MAX_SHORT_LENGTH);
export const keyboardFormSchema = z.object({ keyboard: keyboardBaseSchema });
export const keyboardApiSchema = keyboardBaseSchema;
