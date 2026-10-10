import z from "zod/v4";

export const contactCreateSchema = z.object({
  body: z.string().trim().min(1, "本文を入力してください").max(2000),
});

export const contactReplySchema = z.object({
  contactId: z.string(),
  body: z.string().trim().min(1, "返信内容を入力してください").max(2000),
});
