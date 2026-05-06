import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import z from "zod";
import { STRING_SHORT_LENGTH } from "@/server/drizzle/const";
import { mapBookmarkLists } from "@/server/drizzle/schema/map";

export const MAX_BOOKMARK_LIST_LENGTH = 15;

export const MapBookmarkListFormSchema = z.object({
  title: z.string().trim().min(1).max(STRING_SHORT_LENGTH),
  visibility: z.literal(["public", "private"]),
});

export const CreateMapBookmarkListApiSchema = createInsertSchema(mapBookmarkLists).pick({
  title: true,
  isPublic: true,
});

export const UpdateMapBookmarkListApiSchema = createUpdateSchema(mapBookmarkLists, {
  id: z.number(),
}).pick({
  id: true,
  title: true,
  isPublic: true,
});
