import { boolean, integer, pgEnum, pgTable, timestamp, uniqueIndex, varchar } from "drizzle-orm/pg-core";
import { Maps } from "./map";
import { Users } from "./user";

export const actionEnum = pgEnum("action", ["LIKE", "OVER_TAKE"]);

export const Notifications = pgTable("notifications", {
  id: varchar("id").primaryKey(),
  recipientId: integer("recipient_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  action: actionEnum("action").notNull(),
  checked: boolean("checked").notNull().default(false),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const NotificationLikes = pgTable("notification_likes", {
  notificationId: varchar("notification_id")
    .primaryKey()
    .references(() => Notifications.id, { onDelete: "cascade" }),
  likerId: integer("liker_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  mapId: integer("map_id")
    .notNull()
    .references(() => Maps.id, { onDelete: "cascade" }),
});

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
  (t) => [
    // @see https://github.com/drizzle-team/drizzle-orm/issues/4789?utm_source=chatgpt.com
    // foreignKey({
    //   columns: [t.visitorId, t.mapId],
    //   foreignColumns: [Results.userId, Results.mapId],
    //   name: "notification_over_takes_visitor_result_fk",
    // }).onDelete("cascade"),
    // foreignKey({
    //   columns: [t.visitedId, t.mapId],
    //   foreignColumns: [Results.userId, Results.mapId],
    //   name: "notification_over_takes_visited_result_fk",
    // }).onDelete("cascade"),

    uniqueIndex("uq_overtake_visitor_id_visited_id_map_id").on(t.visitorId, t.visitedId, t.mapId),
  ],
);
