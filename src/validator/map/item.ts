import { createInsertSchema } from "drizzle-zod";
import z from "zod/v4";
import { STRING_LONG_LENGTH, STRING_SHORT_LENGTH } from "@/server/drizzle/const";
import { MAP_VISIBILITY_TYPES, MapDifficulties, YOUTUBE_THUMBNAIL_QUALITIES } from "@/server/drizzle/schema";
import { RawMapSchema } from "./raw-map-json";

export const getByIdOpenApiResponseSchema = z.object({
  id: z.number(),
  media: z.object({
    previewTime: z.number(),
    thumbnailQuality: z.enum(YOUTUBE_THUMBNAIL_QUALITIES),
    videoId: z.string(),
  }),
  info: z.object({
    tags: z.array(z.string()),
    title: z.string(),
    artistName: z.string(),
    source: z.string(),
    duration: z.number(),
  }),
  creator: z.object({
    id: z.number(),
    name: z.string().nullable(),
    comment: z.string(),
  }),
  difficulty: z.object({
    romaKpmMedian: z.number(),
    kanaKpmMedian: z.number(),
    romaKpmMax: z.number(),
    kanaKpmMax: z.number(),
    romaTotalNotes: z.number(),
    kanaTotalNotes: z.number(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

const MapInfoBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "曲名を入力してください" })
    .max(STRING_SHORT_LENGTH, { error: `曲名は${STRING_SHORT_LENGTH}文字以下にしてください` }),
  artistName: z
    .string()
    .trim()
    .min(1, { error: "アーティスト名を入力してください" })
    .max(STRING_SHORT_LENGTH, { error: `アーティスト名は${STRING_SHORT_LENGTH}文字以下にしてください` }),
  musicSource: z
    .string()
    .trim()
    .max(STRING_SHORT_LENGTH, { error: `ソースは${STRING_SHORT_LENGTH}文字以下にしてください` }),
  creatorComment: z
    .string()
    .trim()
    .max(STRING_LONG_LENGTH, { error: `コメントは${STRING_LONG_LENGTH}文字以下にしてください` }),
  tags: z.array(z.string().max(STRING_SHORT_LENGTH)).min(2, { error: "タグは2つ以上必要です" }).max(10),
  videoId: z.string().length(11),
  previewTime: z.coerce.number({
    error: "プレビュータイムは数値である必要があります",
  }),
  visibility: z.enum(MAP_VISIBILITY_TYPES),
});
export const MapInfoFormSchema = MapInfoBaseSchema;

const MapInfoApiSchema = MapInfoBaseSchema.extend({
  thumbnailQuality: z.enum(YOUTUBE_THUMBNAIL_QUALITIES),
  duration: z.number(),
});

const CreateMapDifficultySchema = createInsertSchema(MapDifficulties).pick({
  romaKpmMedian: true,
  kanaKpmMedian: true,
  romaKpmMax: true,
  kanaKpmMax: true,
  romaTotalNotes: true,
  kanaTotalNotes: true,
  kanaChunkCount: true,
  alphabetChunkCount: true,
  numChunkCount: true,
  spaceChunkCount: true,
  symbolChunkCount: true,
});

export const upsertMapItemSchema = z.object({
  mapId: z.number().nullable(),
  mapInfo: MapInfoApiSchema,
  mapDifficulty: CreateMapDifficultySchema,
  rawMapJson: RawMapSchema,
  isMapDataEdited: z.boolean(),
});
