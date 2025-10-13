import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, primaryKey, real, timestamp, unique } from "drizzle-orm/pg-core";
import { Maps } from "./map";
import { Users } from "./user";

export const Results = pgTable(
  "results",
  {
    id: integer("id").primaryKey(),
    mapId: integer("map_id")
      .notNull()
      .references(() => Maps.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
    clapCount: integer("clap_count").notNull().default(0),
    rank: integer("rank").notNull().default(1),
  },
  (t) => [unique("uq_results_user_id_map_id").on(t.userId, t.mapId)],
);

export const ImeResults = pgTable("ime_results", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }),
  mapId: integer("map_id")
    .notNull()
    .references(() => Maps.id, { onDelete: "cascade" }),
  typeCount: integer("type_count").notNull().default(0),
  score: integer("score").notNull().default(0),
});

export const ResultStatuses = pgTable(
  "result_statuses",
  {
    resultId: integer("result_id")
      .primaryKey()
      .references(() => Results.id, { onDelete: "cascade" }),
    score: integer("score").notNull().default(0),
    minPlaySpeed: real("min_play_speed").notNull().default(1),
    kpm: integer("kpm").notNull().default(0),
    rkpm: integer("rkpm").notNull().default(0),
    kanaToRomaKpm: integer("kana_to_roma_kpm").notNull().default(0),
    kanaToRomaRkpm: integer("kana_to_roma_rkpm").notNull().default(0),
    romaType: integer("roma_type").notNull().default(0),
    kanaType: integer("kana_type").notNull().default(0),
    flickType: integer("flick_type").notNull().default(0),
    englishType: integer("english_type").notNull().default(0),
    spaceType: integer("space_type").notNull().default(0),
    symbolType: integer("symbol_type").notNull().default(0),
    numType: integer("num_type").notNull().default(0),
    miss: integer("miss").notNull().default(0),
    lost: integer("lost").notNull().default(0),
    maxCombo: integer("max_combo").notNull().default(0),
    clearRate: real("clear_rate").notNull().default(0),
  },
  (t) => [check("valid_play_speed_values", sql`${t.minPlaySpeed} IN (0.25, 0.5, 0.75, 1.00, 1.25, 1.50, 1.75, 2.00)`)],
);

export const ResultClaps = pgTable(
  "result_claps",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    resultId: integer("result_id")
      .notNull()
      .references(() => Results.id, { onDelete: "cascade" }),
    hasClapped: boolean("has_clapped").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.resultId] })],
);
