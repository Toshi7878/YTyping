import { sql } from "drizzle-orm";
import { boolean, check, integer, pgTable, primaryKey, real, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { maps } from "./map";
import { users } from "./user/user";

export const results = pgTable(
  "results",
  {
    id: integer().primaryKey(),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
    clapCount: integer("clap_count").default(0).notNull(),
    rank: integer().default(1).notNull(),
  },
  (table) => [
    uniqueIndex("uq_results_user_id_map_id").using(
      "btree",
      table.userId.asc().nullsLast(),
      table.mapId.asc().nullsLast(),
    ),
  ],
);

export const resultClaps = pgTable(
  "result_claps",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    resultId: integer("result_id")
      .notNull()
      .references(() => results.id, { onDelete: "cascade" }),
    hasClapped: boolean("has_clapped").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.resultId], name: "result_claps_user_id_result_id_pk" })],
);

export const resultStatuses = pgTable(
  "result_statuses",
  {
    resultId: integer("result_id")
      .primaryKey()
      .references(() => results.id, { onDelete: "cascade" }),
    score: integer().default(0).notNull(),
    minPlaySpeed: real("min_play_speed").default(1).notNull(),
    kpm: integer().default(0).notNull(),
    rkpm: integer().default(0).notNull(),
    kanaToRomaKpm: integer("kana_to_roma_kpm").default(0).notNull(),
    kanaToRomaRkpm: integer("kana_to_roma_rkpm").default(0).notNull(),
    romaType: integer("roma_type").default(0).notNull(),
    kanaType: integer("kana_type").default(0).notNull(),
    flickType: integer("flick_type").default(0).notNull(),
    englishType: integer("english_type").default(0).notNull(),
    spaceType: integer("space_type").default(0).notNull(),
    symbolType: integer("symbol_type").default(0).notNull(),
    numType: integer("num_type").default(0).notNull(),
    miss: integer().default(0).notNull(),
    lost: integer().default(0).notNull(),
    maxCombo: integer("max_combo").default(0).notNull(),
    clearRate: real("clear_rate").default(0).notNull(),
    isCaseSensitive: boolean("is_case_sensitive").default(false).notNull(),
    starRatingSnapshot: real("star_rating_snapshot").default(0).notNull(),
    pp: real().default(0).notNull(),
  },
  () => [
    check(
      "valid_play_speed_values",
      sql`(min_play_speed = ANY (ARRAY[(0.25)::real, (0.5)::real, (0.75)::real, (1.00)::real, (1.25)::real, (1.50)::real, (1.75)::real, (2.00)::real]))`,
    ),
  ],
);

export const imeResults = pgTable("ime_results", {
  id: integer().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mapId: integer("map_id")
    .notNull()
    .references(() => maps.id, { onDelete: "cascade" }),
  typeCount: integer("type_count").default(0).notNull(),
  score: integer().default(0).notNull(),
});
