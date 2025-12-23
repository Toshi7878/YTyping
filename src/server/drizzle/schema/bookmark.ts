import { sql } from "drizzle-orm";
import { boolean, integer, pgTable, primaryKey, serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { MAX_SHORT_LENGTH } from "../const";
import { Maps } from "./map";
import { Users } from "./user";

export const MapBookmarkLists = pgTable("map_bookmark_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: MAX_SHORT_LENGTH }).notNull(),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const MapBookmarkListItems = pgTable(
  "map_bookmark_list_items",
  {
    listId: integer("list_id")
      .notNull()
      .references(() => MapBookmarkLists.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => Maps.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.listId, t.mapId] })],
);
