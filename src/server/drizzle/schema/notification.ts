import { boolean, integer, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { MapBookmarkLists } from "./bookmark";
import { Maps } from "./map";
import { Results } from "./result";
import { Users } from "./user";

export const NOTIFICATION_TYPES = ["LIKE", "CLAP", "OVER_TAKE", "MAP_BOOKMARK"] as const;

export const notificationTypeEnum = pgEnum("type", NOTIFICATION_TYPES);

export const Notifications = pgTable("notifications", {
  id: varchar("id").primaryKey(),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  type: notificationTypeEnum("type").notNull(),
  checked: boolean("checked").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const NotificationLikes = pgTable(
  "notification_likes",
  {
    notificationId: varchar("notification_id")
      .primaryKey()
      .references(() => Notifications.id, { onDelete: "cascade" }),
    likerId: integer("liker_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => Maps.id, { onDelete: "cascade" }),
  },

  (t) => [uniqueIndex("uq_notification_likes_liker_id_map_id").on(t.likerId, t.mapId)],
);

export const NotificationClaps = pgTable(
  "notification_claps",
  {
    notificationId: varchar("notification_id")
      .primaryKey()
      .references(() => Notifications.id, { onDelete: "cascade" }),
    clapperId: integer("clapper_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    resultId: integer("result_id")
      .notNull()
      .references(() => Results.id, { onDelete: "cascade" }),
  },
  (t) => [uniqueIndex("uq_notification_claps_clapper_id_result_id").on(t.clapperId, t.resultId)],
);

export const NotificationOverTakes = pgTable(
  "notification_over_takes",
  {
    notificationId: varchar("notification_id")
      .primaryKey()
      .references(() => Notifications.id, { onDelete: "cascade" }),
    visitorId: integer("visitor_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    visitedId: integer("visited_id").notNull(),
    mapId: integer("map_id")
      .notNull()
      .references(() => Maps.id, { onDelete: "cascade" }),
    prevRank: integer("prev_rank"),
  },
  (t) => [uniqueIndex("uq_notification_over_takes_visitor_id_visited_id_map_id").on(t.visitorId, t.visitedId, t.mapId)],
);

export const NotificationMapBookmarks = pgTable(
  "notification_map_bookmarks",
  {
    notificationId: varchar("notification_id")
      .primaryKey()
      .references(() => Notifications.id, { onDelete: "cascade" }),
    bookmarkerId: integer("bookmarker_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    listId: integer("list_id")
      .notNull()
      .references(() => MapBookmarkLists.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => Maps.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("uq_notification_map_bookmarks_bookmarker_id_list_id_map_id").on(t.bookmarkerId, t.listId, t.mapId),
  ],
);
