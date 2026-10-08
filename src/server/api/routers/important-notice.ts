import { ORPCError } from "@orpc/server";
import { and, desc, eq, ilike, inArray, isNotNull } from "drizzle-orm";
import { nanoid } from "nanoid";
import z from "zod";
import { importantNotices, importantNoticeTargets, users } from "@/server/drizzle/schema";
import { importantNoticeCreateApiSchema } from "@/validator/important-notice";
import { adminProcedure } from "../orpc";

export const importantNoticeRouter = {
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
    const { title, body, audience, expiresAt, targetUserIds } = input;

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
