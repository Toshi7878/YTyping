import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { MAX_SHORT_LENGTH } from "../server/drizzle/const";
import { UserImeTypingOptions, UserOptions, UserTypingOptions } from "../server/drizzle/schema";

export const CreateUserTypingOptionSchema = createInsertSchema(UserTypingOptions).omit({ userId: true });

export const CreateUserImeTypingOptionSchema = createInsertSchema(UserImeTypingOptions, {
  includeRegexPattern: z.string().max(MAX_SHORT_LENGTH),
}).omit({ userId: true });

export const UpsertUserOptionSchema = createUpdateSchema(UserOptions).omit({
  userId: true,
  mapLikeNotify: true,
  overTakeNotify: true,
});
