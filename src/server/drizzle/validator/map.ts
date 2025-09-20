import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { MAX_MAXIMUM_LENGTH, MAX_SHORT_LENGTH } from "../const";
import { MapDifficulties, thumbnailQualityEnum } from "../schema";
import { mapDataSchema } from "./map-json";

const MapInfoBaseSchema = z.object({
  title: z
    .string()
    .min(1, { message: "曲名を入力してください" })
    .max(MAX_SHORT_LENGTH, { message: `曲名は${MAX_SHORT_LENGTH}文字以下にしてください` }),
  artistName: z
    .string()
    .min(1, { message: "アーティスト名を入力してください" })
    .max(MAX_SHORT_LENGTH, { message: `アーティスト名は${MAX_SHORT_LENGTH}文字以下にしてください` }),
  musicSource: z.string().max(MAX_SHORT_LENGTH, { message: `ソースは${MAX_SHORT_LENGTH}文字以下にしてください` }),
  creatorComment: z
    .string()
    .max(MAX_MAXIMUM_LENGTH, { message: `コメントは${MAX_SHORT_LENGTH}文字以下にしてください` }),
  tags: z.array(z.string().max(MAX_SHORT_LENGTH)).min(2, { message: "タグは2つ以上必要です" }).max(10),
  videoId: z.string().length(11),
  previewTime: z.number().refine((value) => !isNaN(Number(value)), {
    message: "プレビュータイムは数値である必要があります",
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
