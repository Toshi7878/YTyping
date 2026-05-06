import { createInsertSchema, createUpdateSchema } from "drizzle-orm/zod";
import { userImeTypingOptions, userOptions, userTypingOptions } from "@/server/drizzle/schema";

export const CreateUserTypingOptionSchema = createInsertSchema(userTypingOptions).pick({
  timeOffset: true,
  mainWordScrollStart: true,
  subWordScrollStart: true,
  isSmoothScroll: true,
  mainWordFontSize: true,
  subWordFontSize: true,
  mainWordTopPosition: true,
  subWordTopPosition: true,
  kanaWordSpacing: true,
  romaWordSpacing: true,
  typeSound: true,
  missSound: true,
  completedTypeSound: true,
  nextDisplay: true,
  lineCompletedDisplay: true,
  timeOffsetAdjustKey: true,
  inputModeToggleKey: true,
  wordDisplay: true,
  isCaseSensitive: true,
});

export const CreateUserImeTypingOptionSchema = createInsertSchema(userImeTypingOptions).pick({
  isCaseSensitive: true,
  enableIncludeRegex: true,
  insertEnglishSpaces: true,
  enableNextLyrics: true,
  includeRegexPattern: true,
  enableLargeVideoDisplay: true,
});

export const UpsertUserOptionSchema = createUpdateSchema(userOptions).pick({
  presenceState: true,
  hideUserStats: true,
  mapListLayout: true,
});
