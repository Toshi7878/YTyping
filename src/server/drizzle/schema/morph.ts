import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const morphConvertKanaDicTypeEnum = pgEnum("morph_convert_kana_dic_type", ["DICTIONARY", "REGEX"]);
export const MorphConvertKanaDic = pgTable("morph_convert_kana_dic", {
  surface: varchar("surface").primaryKey(),
  reading: varchar("reading").notNull(),
  type: morphConvertKanaDicTypeEnum("type").notNull().default("DICTIONARY"),
});

export const FixWordEditLogs = pgTable("fix_word_edit_logs", {
  lyrics: varchar("lyrics").primaryKey(),
  word: varchar("word").notNull(),
});
