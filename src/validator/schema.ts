import { z } from "zod";

export const nameSchema = z.object({
  newName: z
    .string()
    .min(1, "このフィールドを入力してください。")
    .max(15, "最大15文字以内で入力してください")
    .refine(
      (val) => !/^[\s\u200B]+|[\s\u200B]+$/.test(val),
      "文字列の両端にスペースを含めることはできません",
    )
    .refine((val) => !/[\u200B]/.test(val), "ゼロ幅スペースを含めることはできません"),
});
