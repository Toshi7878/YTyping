import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { UserImeTypingOptions, UserOptions, UserTypingOptions } from "@/server/drizzle/schema";

export const CreateUserTypingOptionSchema = createInsertSchema(UserTypingOptions).pick({
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
  InputModeToggleKey: true,
  wordDisplay: true,
  isCaseSensitive: true,
});

export const CreateUserImeTypingOptionSchema = createInsertSchema(UserImeTypingOptions).pick({
  isCaseSensitive: true,
  enableIncludeRegex: true,
  insertEnglishSpaces: true,
  enableNextLyrics: true,
  includeRegexPattern: true,
  enableLargeVideoDisplay: true,
});

export const UpsertUserOptionSchema = createUpdateSchema(UserOptions).pick({
  presenceState: true,
  hideUserStats: true,
  mapListLayout: true,
});
