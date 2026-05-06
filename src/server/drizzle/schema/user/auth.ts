import { sql } from "drizzle-orm";
import { index, integer, pgTable, text, timestamp, unique, varchar } from "drizzle-orm/pg-core";
import { nanoid } from "nanoid";
import { users } from "./user";

export const accounts = pgTable(
  "accounts",
  {
    id: varchar()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text(),
    password: text(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("accounts_userId_idx").using("btree", table.userId.asc().nullsLast())],
);

export const sessions = pgTable(
  "sessions",
  {
    id: varchar()
      .primaryKey()
      .$defaultFn(() => nanoid()),
    expiresAt: timestamp("expires_at").notNull(),
    token: text().notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    impersonatedBy: text("impersonated_by"),
  },
  (table) => [
    index("sessions_userId_idx").using("btree", table.userId.asc().nullsLast()),
    unique("sessions_token_unique").on(table.token),
  ],
);

export const verifications = pgTable("verifications", {
  id: varchar()
    .primaryKey()
    .$defaultFn(() => nanoid()),
  identifier: text().notNull(),
  value: text().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
});
