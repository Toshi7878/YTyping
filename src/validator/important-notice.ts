import z from "zod/v4";
import { IMPORTANT_NOTICE_AUDIENCE_TYPES, IMPORTANT_NOTICE_LEVELS } from "@/server/drizzle/schema";

/** お知らせのリンク先として許可するのは、サイト内パス(/contact など)と https の URL のみ */
export const isAllowedNoticeLinkUrl = (value: string) =>
  (value.startsWith("/") && !value.startsWith("//")) || /^https:\/\/[^\s]+$/.test(value);

// 表示用の名前は変更されうるため選択候補の保持にのみ使い、送信時はidをkeyにする
export const importantNoticeTargetUserSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const importantNoticeFormSchema = z
  .object({
    body: z.string().trim().min(1, "本文を入力してください").max(2000),
    audience: z.enum(IMPORTANT_NOTICE_AUDIENCE_TYPES),
    level: z.enum(IMPORTANT_NOTICE_LEVELS),
    targetUsers: z.array(importantNoticeTargetUserSchema),
    expiresAt: z.string(),
    linkUrl: z.string().trim().max(1024),
    linkLabel: z.string().trim().max(100),
  })
  .refine((v) => v.linkUrl === "" || isAllowedNoticeLinkUrl(v.linkUrl), {
    message: "サイト内のパス（/contact など）か https:// から始まる URL を入力してください",
    path: ["linkUrl"],
  })
  .refine((v) => v.audience !== "SPECIFIC" || v.targetUsers.length > 0, {
    message: "送信対象のユーザーを1人以上指定してください",
    path: ["targetUsers"],
  });

export const importantNoticeCreateApiSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  audience: z.enum(IMPORTANT_NOTICE_AUDIENCE_TYPES),
  level: z.enum(IMPORTANT_NOTICE_LEVELS),
  targetUserIds: z.array(z.number().int().positive()).max(500),
  expiresAt: z.date().optional(),
  linkUrl: z.string().trim().max(1024).refine(isAllowedNoticeLinkUrl).optional(),
  linkLabel: z.string().trim().max(100).optional(),
});
