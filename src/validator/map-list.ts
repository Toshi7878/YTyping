import z from "zod";

export const MAP_SORT_OPTIONS = [
  "id",
  "difficulty",
  "ranking-count",
  "ranking-register",
  "like-count",
  "duration",
  "like",
  "random",
] as const;
export const MAP_USER_FILTER_OPTIONS = ["liked", "created"] as const;
export const MAP_RANKING_STATUS_FILTER_OPTIONS = ["1st", "not-first", "registerd", "unregisterd", "perfect"] as const;
export const MAP_DIFFICULTY_RATE_FILTER_LIMIT = { min: 0, max: 12 };

export const MapSortSearchParamsSchema = z.object({
  value: z.literal(MAP_SORT_OPTIONS).default("id"),
  desc: z.boolean().default(true),
});
export const MapFilterSearchParamsSchema = z.object({
  filter: z.enum(MAP_USER_FILTER_OPTIONS).nullable(),
  rankingStatus: z.enum(MAP_RANKING_STATUS_FILTER_OPTIONS).nullable(),
  keyword: z.string().default(""),
  minRate: z.number().default(MAP_DIFFICULTY_RATE_FILTER_LIMIT.min),
  maxRate: z.number().default(MAP_DIFFICULTY_RATE_FILTER_LIMIT.max),
});

export const SelectMapListApiSchema = z
  .object({
    cursor: z.string().nullable().optional(),
    sort: MapSortSearchParamsSchema.nullable(),
  })
  .extend(MapFilterSearchParamsSchema.shape);

export const SelectMapListByUserIdApiSchema = z.object({
  cursor: z.string().nullable().optional(),
  userId: z.number(),
  sort: MapSortSearchParamsSchema.nullable(),
});

export const SelectMapListByActiveUserApiSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    onlineAt: z.coerce.date(),
    state: z.string(),
    mapId: z.number().nullable(),
  }),
);
