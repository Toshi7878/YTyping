import { ORPCError } from "@orpc/server";
import { and, desc, eq, exists, gt, ilike, inArray, isNotNull, isNull, notExists, or, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import z from "zod";
import {
  importantNoticeAcknowledgements,
  importantNotices,
  importantNoticeTargets,
  users,
} from "@/server/drizzle/schema";
import { importantNoticeCreateApiSchema } from "@/validator/important-notice";
import { adminProcedure, type ORPCContext, protectedProcedure } from "../orpc";

/** 全ユーザー向け、またはユーザーが宛先に指定されているお知らせ */
const buildAudienceCondition = (db: ORPCContext["db"], userId: number) =>
  or(
    eq(importantNotices.audience, "ALL"),
    exists(
      db
        .select({ one: sql`1` })
        .from(importantNoticeTargets)
        .where(
          and(eq(importantNoticeTargets.noticeId, importantNotices.id), eq(importantNoticeTargets.userId, userId)),
        ),
    ),
  );

/** ユーザー宛て（全ユーザー向け、または宛先に指定されている）で、期限内のお知らせ */
const buildDeliveredToUserCondition = (db: ORPCContext["db"], userId: number) =>
  and(
    or(isNull(importantNotices.expiresAt), gt(importantNotices.expiresAt, new Date())),
    buildAudienceCondition(db, userId),
  );

export const importantNoticeRouter = {
  /** ログイン中のユーザー宛てで、期限内かつ未確認のお知らせ */
  getActive: protectedProcedure.handler(async ({ context }) => {
    const { db, session } = context;
    const userId = session.user.id;

    return db
      .select({
        id: importantNotices.id,
        title: importantNotices.title,
        body: importantNotices.body,
        level: importantNotices.level,
        linkUrl: importantNotices.linkUrl,
        linkLabel: importantNotices.linkLabel,
        createdAt: importantNotices.createdAt,
        expiresAt: importantNotices.expiresAt,
      })
      .from(importantNotices)
      .where(
        and(
          buildDeliveredToUserCondition(db, userId),
          notExists(
            db
              .select({ one: sql`1` })
              .from(importantNoticeAcknowledgements)
              .where(
                and(
                  eq(importantNoticeAcknowledgements.noticeId, importantNotices.id),
                  eq(importantNoticeAcknowledgements.userId, userId),
                ),
              ),
          ),
        ),
      )
      .orderBy(desc(importantNotices.createdAt));
  }),

  /** ユーザー宛てだったお知らせの履歴（期限切れ・確認済みを含む）。本人と管理者のみ */
  getHistory: protectedProcedure.input(z.object({ userId: z.number() })).handler(async ({ input, context }) => {
    const { db, session } = context;

    if (session.user.id !== input.userId && session.user.role !== "ADMIN") {
      throw new ORPCError("FORBIDDEN");
    }

    return db
      .select({
        id: importantNotices.id,
        title: importantNotices.title,
        body: importantNotices.body,
        level: importantNotices.level,
        linkUrl: importantNotices.linkUrl,
        linkLabel: importantNotices.linkLabel,
        createdAt: importantNotices.createdAt,
        expiresAt: importantNotices.expiresAt,
        acknowledgedAt: importantNoticeAcknowledgements.acknowledgedAt,
      })
      .from(importantNotices)
      .leftJoin(
        importantNoticeAcknowledgements,
        and(
          eq(importantNoticeAcknowledgements.noticeId, importantNotices.id),
          eq(importantNoticeAcknowledgements.userId, input.userId),
        ),
      )
      .where(buildAudienceCondition(db, input.userId))
      .orderBy(desc(importantNotices.createdAt));
  }),

  /** 「確認しました」を記録する */
  acknowledge: protectedProcedure.input(z.object({ noticeId: z.string() })).handler(async ({ input, context }) => {
    const { db, session } = context;
    const userId = session.user.id;

    const [notice] = await db
      .select({ id: importantNotices.id })
      .from(importantNotices)
      .where(and(eq(importantNotices.id, input.noticeId), buildDeliveredToUserCondition(db, userId)))
      .limit(1);
    if (!notice) throw new ORPCError("NOT_FOUND", { message: "お知らせが見つかりません" });

    await db.insert(importantNoticeAcknowledgements).values({ noticeId: notice.id, userId }).onConflictDoNothing();
  }),

  list: adminProcedure.handler(async ({ context }) => {
    const { db } = context;

    return db.query.importantNotices.findMany({
      orderBy: (t) => [desc(t.createdAt)],
      with: {
        creator: { columns: { id: true, name: true } },
        targets: { with: { user: { columns: { id: true, name: true } } } },
      },
    });
  }),

  // 対象ユーザー選択UIの検索候補用（名前は変更されうるので、選択結果はidで送信する）
  searchUsers: adminProcedure
    .input(z.object({ query: z.string().trim().min(1).max(100) }))
    .handler(async ({ input, context }) => {
      const { db } = context;

      return db
        .select({ id: users.id, name: users.name })
        .from(users)
        .where(and(isNotNull(users.name), ilike(users.name, `%${input.query}%`)))
        .orderBy(users.name)
        .limit(10);
    }),

  create: adminProcedure.input(importantNoticeCreateApiSchema).handler(async ({ input, context }) => {
    const { db, session } = context;
    const { title, body, audience, level, expiresAt, targetUserIds, linkUrl, linkLabel } = input;

    if (audience === "SPECIFIC" && targetUserIds.length === 0) {
      throw new ORPCError("BAD_REQUEST", { message: "送信対象のユーザーを1人以上指定してください" });
    }

    const noticeId = nanoid(10);

    await db.transaction(async (tx) => {
      await tx.insert(importantNotices).values({
        id: noticeId,
        title,
        body,
        audience,
        level,
        linkUrl: linkUrl ?? null,
        linkLabel: linkUrl ? linkLabel || null : null,
        createdBy: session.user.id,
        expiresAt: expiresAt ?? null,
      });

      if (audience === "SPECIFIC") {
        const uniqueTargetUserIds = [...new Set(targetUserIds)];

        const foundUsers = await tx.select({ id: users.id }).from(users).where(inArray(users.id, uniqueTargetUserIds));

        if (foundUsers.length !== uniqueTargetUserIds.length) {
          throw new ORPCError("NOT_FOUND", { message: "存在しないユーザーが含まれています" });
        }

        await tx.insert(importantNoticeTargets).values(uniqueTargetUserIds.map((userId) => ({ noticeId, userId })));
      }
    });
  }),

  delete: adminProcedure.input(z.object({ noticeId: z.string() })).handler(async ({ input, context }) => {
    const { db } = context;

    await db.delete(importantNotices).where(eq(importantNotices.id, input.noticeId));
  }),

  expireNow: adminProcedure.input(z.object({ noticeId: z.string() })).handler(async ({ input, context }) => {
    const { db } = context;

    await db.update(importantNotices).set({ expiresAt: new Date() }).where(eq(importantNotices.id, input.noticeId));
  }),
};
