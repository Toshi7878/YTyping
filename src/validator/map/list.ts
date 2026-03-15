import z from "zod";
import { MAP_CATEGORIES, MAP_VISIBILITY_TYPES, YOUTUBE_THUMBNAIL_QUALITIES } from "@/server/drizzle/schema";

export const MAP_SORT_OPTIONS = [
  "publishedAt",
  "difficulty",
  "ranking-count",
  "ranking-register",
  "like-count",
  "duration",
  "like",
  "bookmark",
  "random",
] as const;
export const MAP_USER_FILTER_OPTIONS = ["liked", "created", "unlisted"] as const;
export const MAP_RANKING_STATUS_FILTER_OPTIONS = ["1st", "not-first", "registerd", "unregisterd", "perfect"] as const;
export const MAP_DIFFICULTY_RATE_FILTER_LIMIT = { min: 0, max: 12 };

export const MapSearchFilterSchema = z.object({
  filterType: z.enum(MAP_USER_FILTER_OPTIONS).nullish(),
  rankingStatus: z.enum(MAP_RANKING_STATUS_FILTER_OPTIONS).nullish(),
  bookmarkListId: z.number().nullish(),
  keyword: z.string().nullish(),
  minRate: z.number().nullish(),
  maxRate: z.number().nullish(),
  creatorId: z.number().nullish(),
  likerId: z.number().nullish(),
});

export const SelectMapListApiSchema = z
  .object({
    cursor: z.number().optional(),
    sortType: z.enum(MAP_SORT_OPTIONS).nullish(),
    isSortDesc: z.boolean().nullish(),
  })
  .extend(MapSearchFilterSchema.shape);

export const MAP_SORT_OPTIONS_WITH_OPEN_API = [
  "publishedAt",
  "difficulty",
  "ranking-count",
  "like-count",
  "duration",
  "bookmark",
  "random",
] as const satisfies (typeof MAP_SORT_OPTIONS)[number][];

export const SelectMapListOpenApiSchema = z.object({
  cursor: z.number().optional(),
  sortType: z.enum(MAP_SORT_OPTIONS_WITH_OPEN_API).nullish(),
  isSortDesc: z.boolean().nullish(),
  bookmarkListId: z.number().nullish(),
  keyword: z.string().nullish(),
  minRate: z.number().nullish(),
  maxRate: z.number().nullish(),
  creatorId: z.number().nullish(),
  likerId: z.number().nullish(),
});

const MapListItemSchema = z.object({
  id: z.number(),
  updatedAt: z.date(),
  media: z.object({
    videoId: z.string(),
    previewTime: z.number(),
    thumbnailQuality: z.enum(YOUTUBE_THUMBNAIL_QUALITIES),
  }),
  info: z.object({
    title: z.string(),
    artistName: z.string(),
    source: z.string(),
    duration: z.number(),
    categories: z.array(z.enum(MAP_CATEGORIES)),
    visibility: z.enum(MAP_VISIBILITY_TYPES),
  }),
  creator: z.object({
    id: z.number(),
    name: z.string().nullable(),
  }),
  difficulty: z.object({
    romaKpmMedian: z.number(),
    kanaKpmMedian: z.number(),
    romaKpmMax: z.number(),
    kanaKpmMax: z.number(),
    romaTotalNotes: z.number(),
    kanaTotalNotes: z.number(),
  }),
  like: z.object({
    count: z.number(),
  }),
  ranking: z.object({
    count: z.number(),
  }),
});

export const GetMapListOpenApiResponseSchema = z.object({
  items: z.array(MapListItemSchema),
  nextCursor: z.number().optional(),
});
