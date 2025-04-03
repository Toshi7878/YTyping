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
    .refine(
      (val) => val === "" || /^http?:\/\/unsi\.nonip\.net\/user\/[0-9]+$/.test(val),
      "URLは「http://unsi.nonip.net/user/{id}」形式のURLである必要があります。"
    ),
});
