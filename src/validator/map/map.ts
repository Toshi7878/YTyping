import { createInsertSchema } from "drizzle-orm/zod";
import z from "zod/v4";
import { translate } from "@/i18n/translate";
import { STRING_LONG_LENGTH, STRING_SHORT_LENGTH } from "@/server/drizzle/const";
import { MAP_VISIBILITY_TYPES, mapDifficulties, YOUTUBE_THUMBNAIL_QUALITIES } from "@/server/drizzle/schema";
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
    .min(1, { error: () => translate("validation.titleRequired") })
    .max(STRING_SHORT_LENGTH, { error: () => translate("validation.titleMax", { max: STRING_SHORT_LENGTH }) }),
  artistName: z
    .string()
    .trim()
    .min(1, { error: () => translate("validation.artistRequired") })
    .max(STRING_SHORT_LENGTH, { error: () => translate("validation.artistMax", { max: STRING_SHORT_LENGTH }) }),
  musicSource: z
    .string()
    .trim()
    .max(STRING_SHORT_LENGTH, { error: () => translate("validation.sourceMax", { max: STRING_SHORT_LENGTH }) }),
  creatorComment: z
    .string()
    .trim()
    .max(STRING_LONG_LENGTH, { error: () => translate("validation.commentMax", { max: STRING_LONG_LENGTH }) }),
  tags: z
    .array(z.string().max(STRING_SHORT_LENGTH))
    .min(2, { error: () => translate("validation.tagsMin") })
    .max(10),
  videoId: z.string().length(11),
  previewTime: z.coerce.number({
    error: () => translate("validation.previewTimeNumber"),
  }),
  visibility: z.enum(MAP_VISIBILITY_TYPES),
});
export const MapInfoFormSchema = MapInfoBaseSchema;

const MapInfoApiSchema = MapInfoBaseSchema.extend({
  thumbnailQuality: z.enum(YOUTUBE_THUMBNAIL_QUALITIES),
  duration: z.number(),
});

const CreateMapDifficultySchema = createInsertSchema(mapDifficulties).pick({
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

export const LrcSchema = z
  .string()
  .min(1, { error: () => translate("validation.lrcEmpty") })
  .refine((content) => content.split(/\r?\n/).some((line) => /\[\d{2}[:.]\d{2}[:.]\d{2}\]/.test(line)), {
    error: () => translate("validation.lrcInvalid"),
  });

export const upsertMapItemSchema = z.object({
  mapId: z.number().nullable(),
  mapInfo: MapInfoApiSchema,
  mapDifficulty: CreateMapDifficultySchema,
  rawMapJson: RawMapSchema,
  isMapDataEdited: z.boolean(),
});
