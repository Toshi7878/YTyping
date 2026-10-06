import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user/user";

export const IMPORTANT_NOTICE_AUDIENCE_TYPES = ["ALL", "SPECIFIC"] as const;
export const importantNoticeAudience = pgEnum("important_notice_audience", IMPORTANT_NOTICE_AUDIENCE_TYPES);

export const importantNotices = pgTable.withRLS("important_notices", {
  id: varchar().primaryKey(),
  title: varchar({ length: 255 }).notNull(),
  body: text().notNull(),
  // ALL: 全ユーザー向け。SPECIFIC: importantNoticeTargets に列挙したユーザーのみ。
  audience: importantNoticeAudience().notNull(),
  createdBy: integer("created_by").references(() => users.id, { onDelete: "set null" }),
  // この日時を過ぎたら全ユーザーに対して自動的に非表示（確認済み扱い）になる
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});

// audience = SPECIFIC のお知らせの配信先ユーザー（ALL の場合は行を作らない）
export const importantNoticeTargets = pgTable.withRLS(
  "important_notice_targets",
  {
    noticeId: varchar("notice_id")
      .notNull()
      .references(() => importantNotices.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.noticeId, table.userId], name: "important_notice_targets_notice_id_user_id_pk" }),
  ],
);

// ユーザーが「確認しました」を押した記録。期限切れによる自動非表示はここに書き込まず expiresAt 判定のみで表現する
export const importantNoticeAcknowledgements = pgTable.withRLS(
  "important_notice_acknowledgements",
  {
    noticeId: varchar("notice_id")
      .notNull()
      .references(() => importantNotices.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    acknowledgedAt: timestamp("acknowledged_at").default(sql`now()`).notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.noticeId, table.userId],
      name: "important_notice_acknowledgements_notice_id_user_id_pk",
    }),
  ],
);
