import { sql } from "drizzle-orm";
import { integer, pgEnum, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { users } from "./user/user";

export const IMPORTANT_NOTICE_AUDIENCE_TYPES = ["ALL", "SPECIFIC"] as const;
export const importantNoticeAudience = pgEnum("important_notice_audience", IMPORTANT_NOTICE_AUDIENCE_TYPES);

// INFO: 通常のお知らせ。WARNING: 警告として目立たせて表示するお知らせ。
export const IMPORTANT_NOTICE_LEVELS = ["INFO", "WARNING"] as const;
export const importantNoticeLevel = pgEnum("important_notice_level", IMPORTANT_NOTICE_LEVELS);

export const importantNotices = pgTable.withRLS("important_notices", {
  id: varchar().primaryKey(),
  body: text().notNull(),
  // ALL: 全ユーザー向け。SPECIFIC: importantNoticeTargets に列挙したユーザーのみ。
  audience: importantNoticeAudience().notNull(),
  level: importantNoticeLevel().default("INFO").notNull(),
  // お知らせカードに表示するリンクボタン（任意）。サイト内パス(/contact など)か https の URL
  linkUrl: varchar("link_url", { length: 1024 }),
  linkLabel: varchar("link_label", { length: 100 }),
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
