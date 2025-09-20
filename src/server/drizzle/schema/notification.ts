import { boolean, foreignKey, integer, pgEnum, pgTable, serial, timestamp, unique } from "drizzle-orm/pg-core";
import { Maps } from "./map";
import { Results } from "./result";
import { Users } from "./user";

export const actionEnum = pgEnum("action", ["LIKE", "OVER_TAKE"]);
export const Notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    visitorId: integer("visitor_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    visitedId: integer("visited_id").notNull(),
    mapId: integer("map_id")
      .notNull()
      .references(() => Maps.id, { onDelete: "cascade" }),
    action: actionEnum("action").notNull().default("OVER_TAKE"),
    oldRank: integer("old_rank"),
    checked: boolean("checked").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [
    foreignKey({
      columns: [t.visitorId, t.mapId],
      foreignColumns: [Results.userId, Results.mapId],
      name: "notifications_visitor_result_fk",
    }).onDelete("cascade"),
    foreignKey({
      columns: [t.visitedId, t.mapId],
      foreignColumns: [Results.userId, Results.mapId],
      name: "notifications_visited_result_fk",
    }).onDelete("cascade"),

    unique("uq_notifications_visitor_visited_map_action").on(t.visitorId, t.visitedId, t.mapId, t.action),
  ],
);
