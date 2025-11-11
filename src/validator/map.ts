import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { MAX_MAXIMUM_LENGTH, MAX_SHORT_LENGTH } from "../server/drizzle/const";
import { MapDifficulties, thumbnailQualityEnum } from "../server/drizzle/schema";
import { mapDataSchema } from "./map-json";

const MapInfoBaseSchema = z.object({
  title: z
    .string()
    .min(1, { error: "曲名を入力してください" })
    .max(MAX_SHORT_LENGTH, { error: `曲名は${MAX_SHORT_LENGTH}文字以下にしてください` }),
  artistName: z
    .string()
    .min(1, { error: "アーティスト名を入力してください" })
    .max(MAX_SHORT_LENGTH, { error: `アーティスト名は${MAX_SHORT_LENGTH}文字以下にしてください` }),
  musicSource: z.string().max(MAX_SHORT_LENGTH, { error: `ソースは${MAX_SHORT_LENGTH}文字以下にしてください` }),
  creatorComment: z.string().max(MAX_MAXIMUM_LENGTH, { error: `コメントは${MAX_SHORT_LENGTH}文字以下にしてください` }),
  tags: z.array(z.string().max(MAX_SHORT_LENGTH)).min(2, { error: "タグは2つ以上必要です" }).max(10),
  videoId: z.string().length(11),
  previewTime: z.coerce.number({
    error: "プレビュータイムは数値である必要があります",
  }),
});
export const MapInfoFormSchema = MapInfoBaseSchema;

const MapInfoApiSchema = MapInfoBaseSchema.extend({
  thumbnailQuality: z.enum(thumbnailQualityEnum.enumValues),
  duration: z.number(),
});

const CreateMapDifficultySchema = createInsertSchema(MapDifficulties).omit({
  intTotalNotes: true,
  englishTotalNotes: true,
  mapId: true,
  symbolTotalNotes: true,
});

export const UpsertMapSchema = z.object({
  mapId: z.number().nullable(),
  mapInfo: MapInfoApiSchema,
  mapDifficulty: CreateMapDifficultySchema,
  mapData: mapDataSchema,
  isMapDataEdited: z.boolean(),
});

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

export const SelectPlayingMapByActiveUserApiSchema = z.array(
  z.object({
    id: z.number(),
    name: z.string(),
    onlineAt: z.coerce.date(),
    state: z.string(),
    mapId: z.number().nullable(),
  }),
);
