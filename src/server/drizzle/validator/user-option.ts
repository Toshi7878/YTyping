import { createInsertSchema } from "drizzle-zod"
import z from "zod"
import { MAX_SHORT_LENGTH } from "../const"
import { UserImeTypingOptions, UserOptions, UserTypingOptions } from "../schema"

export const CreateUserTypingOptionSchema = createInsertSchema(UserTypingOptions).omit({ userId: true })

export const CreateUserImeTypingOptionSchema = createInsertSchema(UserImeTypingOptions, {
  addSymbolList: z.string().max(MAX_SHORT_LENGTH),
}).omit({ userId: true })

export const CreateUserOptionSchema = createInsertSchema(UserOptions).omit({
  userId: true,
  mapLikeNotify: true,
  overTakeNotify: true,
})
