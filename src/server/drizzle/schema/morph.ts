import { pgEnum, pgTable, varchar } from "drizzle-orm/pg-core";

export const readingConversionDictType = pgEnum("reading_conversion_dict_type", ["DICTIONARY", "REGEX"]);

export const readingConversionDict = pgTable("reading_conversion_dict", {
  surface: varchar().primaryKey(),
  reading: varchar().notNull(),
  type: readingConversionDictType().default("DICTIONARY").notNull(),
});

export const fixWordEditLogs = pgTable("fix_word_edit_logs", {
  lyrics: varchar().primaryKey(),
  word: varchar().notNull(),
});
