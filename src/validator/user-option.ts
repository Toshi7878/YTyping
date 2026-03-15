import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import z from "zod";
import { STRING_LONG_LENGTH } from "../server/drizzle/const";
import { UserImeTypingOptions, UserOptions, UserTypingOptions } from "../server/drizzle/schema";

export const CreateUserTypingOptionSchema = createInsertSchema(UserTypingOptions).omit({ userId: true });

export const CreateUserImeTypingOptionSchema = createInsertSchema(UserImeTypingOptions, {
  includeRegexPattern: z.string().max(STRING_LONG_LENGTH),
}).omit({ userId: true });

export const UpsertUserOptionSchema = createUpdateSchema(UserOptions).omit({
  userId: true,
});
