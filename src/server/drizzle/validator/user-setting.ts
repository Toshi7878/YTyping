import z from "zod";
import { MAX_SHORT_LENGTH } from "./const";

import { ja } from "zod/locales";

z.config(ja());

export const UserNameSchema = z.object({
  newName: z
    .string()
    .min(1)
    .max(15)
    .refine(
      (val) => !/^[\s\u200B\u3000\t]+|[\s\u200B\u3000\t]+$/.test(val),
      "文字列の両端にスペースを含めることはできません",
    )
    .refine((val) => !/[\u200B]/.test(val), "ゼロ幅スペースを含めることはできません"),
});

const FingerChartUrlBaseSchema = z
  .string()
  .max(100)
  .refine(
    (val) => val === "" || /^http?:\/\/unsi\.nonip\.net\/user\/[0-9]+$/.test(val),
    "URLは「http://unsi.nonip.net/user/{id}」形式のURLである必要があります。",
  );
export const FingerChartUrlFormSchema = z.object({ url: FingerChartUrlBaseSchema });
export const FingerChartUrlApiSchema = FingerChartUrlBaseSchema;

const MyKeyboardBaseSchema = z.string().max(MAX_SHORT_LENGTH);
export const MyKeyboardFormSchema = z.object({ myKeyboard: MyKeyboardBaseSchema });
export const MyKeyboardApiSchema = MyKeyboardBaseSchema;
