import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const readingConversionTypeEnum = pgEnum("reading_conversion_dict_type", ["DICTIONARY", "REGEX"]);
export const ReadingConversionDict = pgTable("reading_conversion_dict", {
  surface: varchar("surface").primaryKey(),
  reading: varchar("reading").notNull(),
  type: readingConversionTypeEnum("type").notNull().default("DICTIONARY"),
});

export const FixWordEditLogs = pgTable("fix_word_edit_logs", {
  lyrics: varchar("lyrics").primaryKey(),
  word: varchar("word").notNull(),
});
