import { sql } from "drizzle-orm";
import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user/user";

// お問い合わせ。1件につき、ユーザーの内容と、運営からの返信（任意）を持つ
export const contacts = pgTable.withRLS("contacts", {
  id: varchar().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  body: text().notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  // 運営からの返信。null なら未返信
  replyBody: text("reply_body"),
  repliedBy: integer("replied_by").references(() => users.id, { onDelete: "set null" }),
  repliedAt: timestamp("replied_at"),
  // 返信を、問い合わせたユーザーが「確認しました」を押した日時。null ならトップページに表示し続ける
  replyAcknowledgedAt: timestamp("reply_acknowledged_at"),
});
