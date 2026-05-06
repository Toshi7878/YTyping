import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";

export const USER_ROLE_TYPES = ["USER", "ADMIN"] as const;
export const role = pgEnum("role", USER_ROLE_TYPES);

export const users = pgTable(
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
  },
  (table) => [unique("users_email_hash_unique").on(table.emailHash), unique("users_name_unique").on(table.name)],
);

export const userProfiles = pgTable("user_profiles", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fingerChartUrl: varchar("finger_chart_url", { length: 256 }).default("").notNull(),
  keyboard: varchar({ length: 1024 }).default("").notNull(),
});
