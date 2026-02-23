import z from "zod";

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

export const MapSortSearchParamsSchema = z
  .object({
    value: z.literal(MAP_SORT_OPTIONS),
    desc: z.boolean(),
  })
  .optional();

export const MapSearchFilterSchema = z.object({
  filter: z.enum(MAP_USER_FILTER_OPTIONS).nullish(),
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
    sort: MapSortSearchParamsSchema,
  })
  .extend(MapSearchFilterSchema.shape);
