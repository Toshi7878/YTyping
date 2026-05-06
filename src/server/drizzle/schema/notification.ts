import { sql } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { mapBookmarkLists, maps } from "./map";
import { results } from "./result";
import { users } from "./user/user";

export const type = pgEnum("type", ["LIKE", "CLAP", "OVER_TAKE", "MAP_BOOKMARK"]);

export const notificationClaps = pgTable(
  "notification_claps",
  {
    notificationId: varchar("notification_id")
      .primaryKey()
      .references(() => notifications.id, { onDelete: "cascade" }),
    clapperId: integer("clapper_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resultId: integer("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("uq_notification_claps_clapper_id_result_id").using(
      "btree",
      table.clapperId.asc().nullsLast(),
      table.resultId.asc().nullsLast(),
    ),
  ],
);

export const notificationLikes = pgTable(
  "notification_likes",
  {
    notificationId: varchar("notification_id")
      .primaryKey()
      .references(() => notifications.id, { onDelete: "cascade" }),
    likerId: integer("liker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("uq_notification_likes_liker_id_map_id").using(
      "btree",
      table.likerId.asc().nullsLast(),
      table.mapId.asc().nullsLast(),
    ),
  ],
);

export const notificationMapBookmarks = pgTable(
  "notification_map_bookmarks",
  {
    notificationId: varchar("notification_id")
      .primaryKey()
      .references(() => notifications.id, { onDelete: "cascade" }),
    bookmarkerId: integer("bookmarker_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    listId: integer("list_id")
      .notNull()
      .references(() => mapBookmarkLists.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("uq_notification_map_bookmarks_bookmarker_id_list_id_map_id").using(
      "btree",
      table.bookmarkerId.asc().nullsLast(),
      table.listId.asc().nullsLast(),
      table.mapId.asc().nullsLast(),
    ),
  ],
);

export const notificationOverTakes = pgTable(
  "notification_over_takes",
  {
    notificationId: varchar("notification_id")
      .primaryKey()
      .references(() => notifications.id, { onDelete: "cascade" }),
    visitorId: integer("visitor_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    visitedId: integer("visited_id").notNull(),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    prevRank: integer("prev_rank"),
  },
  (table) => [
    uniqueIndex("uq_notification_over_takes_visitor_id_visited_id_map_id").using(
      "btree",
      table.visitorId.asc().nullsLast(),
      table.visitedId.asc().nullsLast(),
      table.mapId.asc().nullsLast(),
    ),
  ],
);

export const notifications = pgTable("notifications", {
  id: varchar().primaryKey(),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: type().notNull(),
  checked: boolean().default(false).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
});
