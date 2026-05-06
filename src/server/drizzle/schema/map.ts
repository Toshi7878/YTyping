import { sql } from "drizzle-orm";
import {
  boolean,
  char,
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
import { users } from "./user/user";

export const MAP_CATEGORIES = ["CSS", "SPEED_SHIFT", "CASE_SENSITIVE"] as const;
export const category = pgEnum("category", ["CSS", "SPEED_SHIFT", "CASE_SENSITIVE"]);
export const YOUTUBE_THUMBNAIL_QUALITIES = ["mqdefault", "maxresdefault"] as const;
export const thumbnailQuality = pgEnum("thumbnail_quality", ["mqdefault", "maxresdefault"]);
export const MAP_VISIBILITY_TYPES = ["PUBLIC", "UNLISTED"] as const;
export const mapVisibility = pgEnum("map_visibility", ["PUBLIC", "UNLISTED"]);

export const maps = pgTable("maps", {
  id: integer().primaryKey(),
  videoId: char("video_id", { length: 11 }).notNull(),
  title: varchar({ length: 256 }).notNull(),
  artistName: varchar("artist_name", { length: 256 }).notNull(),
  musicSource: varchar("music_source", { length: 256 }).notNull(),
  creatorComment: varchar("creator_comment", { length: 1024 }).notNull(),
  tags: text().array().default(sql`ARRAY[]`).notNull(),
  creatorId: integer("creator_id")
    .notNull()
    .references(() => users.id),
  previewTime: real("preview_time").default(0).notNull(),
  duration: real().default(0).notNull(),
  playCount: integer("play_count").default(0).notNull(),
  likeCount: integer("like_count").default(0).notNull(),
  rankingCount: integer("ranking_count").default(0).notNull(),
  category: category().array().default(sql`ARRAY[]`).notNull(),
  thumbnailQuality: thumbnailQuality("thumbnail_quality").default("mqdefault").notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`now()`).notNull(),
  publishedAt: timestamp("published_at"),
  visibility: mapVisibility().notNull(),
});

export const mapDifficulties = pgTable("map_difficulties", {
  mapId: integer("map_id")
    .primaryKey()
    .references(() => maps.id, { onDelete: "cascade" }),
  romaKpmMedian: integer("roma_kpm_median").default(0).notNull(),
  romaKpmMax: integer("roma_kpm_max").default(0).notNull(),
  kanaKpmMedian: integer("kana_kpm_median").default(0).notNull(),
  kanaKpmMax: integer("kana_kpm_max").default(0).notNull(),
  romaTotalNotes: integer("roma_total_notes").default(0).notNull(),
  kanaTotalNotes: integer("kana_total_notes").default(0).notNull(),
  alphabetChunkCount: integer("alphabet_chunk_count").default(0).notNull(),
  symbolChunkCount: integer("symbol_chunk_count").default(0).notNull(),
  numChunkCount: integer("num_chunk_count").default(0).notNull(),
  rating: real().notNull(),
  kanaChunkCount: integer("kana_chunk_count").default(0).notNull(),
  spaceChunkCount: integer("space_chunk_count").default(0).notNull(),
});

export const mapLikes = pgTable(
  "map_likes",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    hasLiked: boolean("has_liked").notNull(),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.mapId], name: "map_likes_user_id_map_id_pk" })],
);

export const mapBookmarkListItems = pgTable(
  "map_bookmark_list_items",
  {
    listId: integer("list_id")
      .notNull()
      .references(() => mapBookmarkLists.id, { onDelete: "cascade" }),
    mapId: integer("map_id")
      .notNull()
      .references(() => maps.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  },
  (table) => [primaryKey({ columns: [table.listId, table.mapId], name: "map_bookmark_list_items_list_id_map_id_pk" })],
);

export const mapBookmarkLists = pgTable("map_bookmark_lists", {
  id: serial().primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar({ length: 256 }).notNull(),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").default(sql`now()`).notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});
