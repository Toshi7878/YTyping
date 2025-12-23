import { createInsertSchema } from "drizzle-zod";
import z from "zod";
import { MAX_SHORT_LENGTH } from "@/server/drizzle/const";
import { MapBookmarkLists } from "@/server/drizzle/schema";

export const MAX_BOOKMARK_LIST_LENGTH = 15;

export const MapBookmarkListFormSchema = z.object({
  title: z.string().trim().min(1).max(MAX_SHORT_LENGTH),
  visibility: z.literal(["public", "private"]),
});

export const MapBookmarkListApiSchema = createInsertSchema(MapBookmarkLists).pick({
  title: true,
  isPublic: true,
});

export const IncrementImeTypeCountStatsSchema = z.object({
  typingTime: z.number().min(0),
  imeTypeCount: z.number().min(0),
});
