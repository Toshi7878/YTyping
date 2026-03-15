import z from "zod/v4";
import { YOUTUBE_THUMBNAIL_QUALITIES } from "@/server/drizzle/schema";

export const MapItemOpenApiResponseSchema = z.object({
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
