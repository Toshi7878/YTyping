import { sql } from "drizzle-orm";
import {
  boolean,
  char,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { Users } from "./user";

export const categoryEnum = pgEnum("category", ["CSS", "SPEED_SHIFT"]);
export const thumbnailQualityEnum = pgEnum("thumbnail_quality", ["mqdefault", "maxresdefault"]);
export const Maps = pgTable("maps", {
  id: serial("id").primaryKey(),
  videoId: char("video_id", { length: 11 }).notNull(),
  title: varchar("title").notNull().default(""),
  artistName: varchar("artist_name").notNull().default(""),
  musicSource: varchar("music_source").notNull().default(""),
  creatorComment: varchar("creator_comment").notNull().default(""),
  tags: text("tags")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => Users.id),
  previewTime: real("preview_time").notNull().default(0),
  playCount: integer("play_count").notNull().default(0),
  likeCount: integer("like_count").notNull().default(0),
  rankingCount: integer("ranking_count").notNull().default(0),
  category: categoryEnum("category")
    .array()
    .notNull()
    .default(sql`ARRAY[]::category[]`),
  thumbnailQuality: thumbnailQualityEnum("thumbnail_quality").notNull().default("mqdefault"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const MapDifficulties = pgTable("map_difficulties", {
  mapId: integer("map_id")
    .primaryKey()
    .references(() => Maps.id, { onDelete: "cascade" }),
  romaKpmMedian: integer("roma_kpm_median").notNull().default(0),
  romaKpmMax: integer("roma_kpm_max").notNull().default(0),
  kanaKpmMedian: integer("kana_kpm_median").notNull().default(0),
  kanaKpmMax: integer("kana_kpm_max").notNull().default(0),
  totalTime: doublePrecision("total_time").notNull().default(0),
  romaTotalNotes: integer("roma_total_notes").notNull().default(0),
  kanaTotalNotes: integer("kana_total_notes").notNull().default(0),
  englishTotalNotes: integer("english_total_notes").notNull().default(0),
  symbolTotalNotes: integer("symbol_total_notes").notNull().default(0),
  intTotalNotes: integer("int_total_notes").notNull().default(0),
});

export const MapLikes = pgTable(
  "map_likes",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => Maps.id, { onDelete: "cascade" }),
    isLiked: boolean("is_liked").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.mapId] })],
);
