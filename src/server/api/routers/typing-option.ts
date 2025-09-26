import { eq } from "drizzle-orm"
import { UserImeTypingOptions, UserOptions, UserTypingOptions } from "@/server/drizzle/schema"
import {
  CreateUserImeTypingOptionSchema,
  CreateUserOptionSchema,
  CreateUserTypingOptionSchema,
} from "@/server/drizzle/validator/user-option"
import { optionalAuthProcedure, protectedProcedure } from "../trpc"

export const userOptionRouter = {
  getUserOptions: optionalAuthProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx
    if (!user) return null

    const userOption = await db.query.UserOptions.findFirst({
      columns: {
        mapLikeNotify: false,
        userId: false,
        overTakeNotify: false,
      },
      where: eq(UserOptions.userId, user.id),
    })

    return userOption ?? null
  }),
  getUserTypingOptions: optionalAuthProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx
    if (!user) return null

    return (
      (await db.query.UserTypingOptions.findFirst({
        columns: { userId: false },
        where: eq(UserTypingOptions.userId, user.id),
      })) ?? null
    )
  }),
  getUserImeTypingOptions: optionalAuthProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx
    if (!user) return null

    return (
      (await db.query.UserImeTypingOptions.findFirst({
        columns: { userId: false },
        where: eq(UserImeTypingOptions.userId, user.id),
      })) ?? null
    )
  }),

  updateTypeOptions: protectedProcedure.input(CreateUserTypingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx

    await db
      .insert(UserTypingOptions)
      .values({ userId: user.id, ...input })
      .onConflictDoUpdate({ target: [UserTypingOptions.userId], set: { ...input } })
  }),

  updateImeTypeOptions: protectedProcedure.input(CreateUserImeTypingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx

    await db
      .insert(UserImeTypingOptions)
      .values({ userId: user.id, ...input })
      .onConflictDoUpdate({ target: [UserImeTypingOptions.userId], set: { ...input } })
  }),

  updateOptions: protectedProcedure.input(CreateUserOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx
    const { customUserActiveState, hideUserStats } = input

    await db
      .insert(UserOptions)
      .values({ userId: user.id, customUserActiveState, hideUserStats })
      .onConflictDoUpdate({ target: [UserOptions.userId], set: { customUserActiveState, hideUserStats } })
      .returning({
        customUserActiveState: UserOptions.customUserActiveState,
        hideUserStats: UserOptions.hideUserStats,
      })
  }),
}
