import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, gt, isNotNull, isNull, sql } from "drizzle-orm";
import { nanoid } from "nanoid";
import z from "zod";
import { contacts, users } from "@/server/drizzle/schema";
import { contactCreateSchema, contactReplySchema } from "@/validator/contact";
import { adminProcedure, protectedProcedure } from "../orpc";

/** 短時間の連続送信を防ぐ: この時間内に送れる件数 */
const CREATE_LIMIT = { count: 3, windowMs: 10 * 60 * 1000 };

export const contactRouter = {
  /** お問い合わせを送信する */
  create: protectedProcedure.input(contactCreateSchema).handler(async ({ input, context }) => {
    const { db, session } = context;
    const userId = session.user.id;

    const recentCount = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(contacts)
      .where(and(eq(contacts.userId, userId), gt(contacts.createdAt, new Date(Date.now() - CREATE_LIMIT.windowMs))))
      .then((rows) => rows[0]?.count ?? 0);
    if (recentCount >= CREATE_LIMIT.count) {
      throw new ORPCError("TOO_MANY_REQUESTS", {
        message: "短時間に送信しすぎです。しばらく時間をおいてからもう一度お試しください",
      });
    }

    const id = nanoid(10);
    await db.insert(contacts).values({ id, userId, body: input.body });

    return { id };
  }),

  /** 自分のお問い合わせ履歴（返信を含む） */
  listMine: protectedProcedure.handler(async ({ context }) => {
    const { db, session } = context;

    return db
      .select({
        id: contacts.id,
        body: contacts.body,
        createdAt: contacts.createdAt,
        replyBody: contacts.replyBody,
        repliedAt: contacts.repliedAt,
      })
      .from(contacts)
      .where(eq(contacts.userId, session.user.id))
      .orderBy(desc(contacts.createdAt));
  }),

  /** トップページに表示する、未確認の運営からの返信 */
  getUnacknowledgedReplies: protectedProcedure.handler(async ({ context }) => {
    const { db, session } = context;

    return db
      .select({
        id: contacts.id,
        body: contacts.body,
        replyBody: contacts.replyBody,
        repliedAt: contacts.repliedAt,
      })
      .from(contacts)
      .where(
        and(eq(contacts.userId, session.user.id), isNotNull(contacts.replyBody), isNull(contacts.replyAcknowledgedAt)),
      )
      .orderBy(desc(contacts.repliedAt));
  }),

  /** 返信を「確認しました」にする（トップページから非表示になる） */
  acknowledgeReply: protectedProcedure
    .input(z.object({ contactId: z.string() }))
    .handler(async ({ input, context }) => {
      const { db, session } = context;

      const updated = await db
        .update(contacts)
        .set({ replyAcknowledgedAt: new Date() })
        .where(
          and(eq(contacts.id, input.contactId), eq(contacts.userId, session.user.id), isNotNull(contacts.replyBody)),
        )
        .returning({ id: contacts.id });
      if (updated.length === 0) throw new ORPCError("NOT_FOUND", { message: "返信が見つかりません" });
    }),

  /** 全ユーザーのお問い合わせ一覧（未返信が先） */
  adminList: adminProcedure.handler(async ({ context }) => {
    const { db } = context;

    return db
      .select({
        id: contacts.id,
        body: contacts.body,
        createdAt: contacts.createdAt,
        replyBody: contacts.replyBody,
        repliedAt: contacts.repliedAt,
        user: { id: users.id, name: users.name },
      })
      .from(contacts)
      .innerJoin(users, eq(users.id, contacts.userId))
      .orderBy(asc(sql`case when ${contacts.replyBody} is null then 0 else 1 end`), desc(contacts.createdAt));
  }),

  /** お問い合わせに返信する。すでに返信がある場合は上書きし、ユーザーには改めて未確認として表示される */
  reply: adminProcedure.input(contactReplySchema).handler(async ({ input, context }) => {
    const { db, session } = context;

    const updated = await db
      .update(contacts)
      .set({
        replyBody: input.body,
        repliedBy: session.user.id,
        repliedAt: new Date(),
        replyAcknowledgedAt: null,
      })
      .where(eq(contacts.id, input.contactId))
      .returning({ id: contacts.id });
    if (updated.length === 0) throw new ORPCError("NOT_FOUND", { message: "お問い合わせが見つかりません" });
  }),
};
