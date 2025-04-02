import { custom_user_active_state } from "@prisma/client";
import { z } from "zod";

export const nameSchema = z.object({
  newName: z
    .string()
    .min(1, "名前は1文字以上である必要があります。")
    .max(15, "名前は15文字以内である必要があります。")
    .refine(
      (val) => !/^[\s\u200B\u3000\t]+|[\s\u200B\u3000\t]+$/.test(val),
      "文字列の両端にスペースを含めることはできません"
    )
    .refine((val) => !/[\u200B]/.test(val), "ゼロ幅スペースを含めることはできません"),
});

export const userOptionSchema = z.object({
  custom_user_active_state: z.nativeEnum(custom_user_active_state),
});

export const userFingerChartUrlSchema = z.object({
  url: z
    .string()
    .url("有効なURLを入力してください")
    .refine(
      (val) => /^https?:\/\/unsi\.nonip\.net\/user\/[0-9]+$/.test(val),
      "URLは「http://unsi.nonip.net/user/」で始まり、有効なURLである必要があります。"
    ),
  username: z.string().optional(),
});
