import z from "zod/v4";
import { IMPORTANT_NOTICE_AUDIENCE_TYPES } from "@/server/drizzle/schema";

// 表示用の名前は変更されうるため選択候補の保持にのみ使い、送信時はidをkeyにする
export const importantNoticeTargetUserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const importantNoticeFormSchema = z
  .object({
    title: z.string().trim().min(1, "タイトルを入力してください").max(255),
    body: z.string().trim().min(1, "本文を入力してください").max(2000),
    audience: z.enum(IMPORTANT_NOTICE_AUDIENCE_TYPES),
    targetUsers: z.array(importantNoticeTargetUserSchema),
    expiresAt: z.string(),
  })
  .refine((v) => v.audience !== "SPECIFIC" || v.targetUsers.length > 0, {
    message: "送信対象のユーザーを1人以上指定してください",
    path: ["targetUsers"],
  });

export const importantNoticeCreateApiSchema = z.object({
  title: z.string().trim().min(1).max(255),
  body: z.string().trim().min(1).max(2000),
  audience: z.enum(IMPORTANT_NOTICE_AUDIENCE_TYPES),
  targetUserIds: z.array(z.number().int().positive()).max(500),
  expiresAt: z.date().optional(),
});
