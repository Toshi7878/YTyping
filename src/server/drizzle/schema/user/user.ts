import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";

export const USER_ROLE_TYPES = ["USER", "ADMIN"] as const;
export const role = pgEnum("role", USER_ROLE_TYPES);

export const users = pgTable.withRLS(
  "users",
  {
    id: serial().primaryKey(),
    name: varchar(),
    emailHash: varchar("email_hash").notNull(),
    role: role().default("USER").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
    emailVerified: boolean("email_verified").default(true).notNull(),
    image: text(),
    banned: boolean().default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    warningCount: integer("warning_count").default(0).notNull(),
  },
  (table) => [unique("users_email_hash_unique").on(table.emailHash), unique("users_name_unique").on(table.name)],
);

export const userProfiles = pgTable.withRLS("user_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fingerChartUrl: varchar("finger_chart_url", { length: 256 }).default("").notNull(),
  keyboard: varchar({ length: 1024 }).default("").notNull(),
});

export const REPORT_STATUS_TYPES = ["PENDING", "RESOLVED", "DISMISSED", "WARNED"] as const;
export const reportStatus = pgEnum("report_status", REPORT_STATUS_TYPES);

export const REPORT_REASON_TYPES = ["CHEATING", "HARASSMENT", "SPAM", "INAPPROPRIATE", "OTHER"] as const;
export const reportReason = pgEnum("report_reason", REPORT_REASON_TYPES);

export const userReports = pgTable.withRLS("user_reports", {
  id: serial().primaryKey(),
  reporterId: integer("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reportedUserId: integer("reported_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reason: reportReason().notNull(),
  reasonDetail: varchar("reason_detail", { length: 500 }).notNull(),
  status: reportStatus().default("PENDING").notNull(),
  adminNote: text("admin_note"),
  resolvedBy: integer("resolved_by").references(() => users.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
});
