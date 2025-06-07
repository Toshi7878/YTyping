import { custom_user_active_state } from "@prisma/client";
import { MAX_SHORT_LENGTH } from "./const";
import { z } from "./z";

export const nameSchema = z.object({
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

export const userOptionSchema = z.object({
  custom_user_active_state: z.nativeEnum(custom_user_active_state),
  hide_user_stats: z.boolean(),
});

const fingerChartUrlBaseSchema = z
  .string()
  .max(100)
  .refine(
    (val) => val === "" || /^http?:\/\/unsi\.nonip\.net\/user\/[0-9]+$/.test(val),
    "URLは「http://unsi.nonip.net/user/{id}」形式のURLである必要があります。",
  );
export const fingerChartUrlApiSchema = fingerChartUrlBaseSchema;
export const fingerChartUrlFormSchema = z.object({ url: fingerChartUrlBaseSchema });

const myKeyboardBaseSchema = z.string().max(MAX_SHORT_LENGTH);
export const myKeyboardApiSchema = myKeyboardBaseSchema;
export const myKeyboardFormSchema = z.object({ myKeyboard: z.string().max(MAX_SHORT_LENGTH) });
