import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UserImeTypingOptions } from "@/server/drizzle/schema";
import { CreateUserImeTypingOptionSchema } from "@/validator/user-option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userImeTypingOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    if (!user) return null;

    return (
      (await db.query.UserImeTypingOptions.findFirst({
        columns: { userId: false },
        where: eq(UserImeTypingOptions.userId, user.id),
      })) ?? null
    );
  }),

  upsert: protectedProcedure.input(CreateUserImeTypingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db
      .insert(UserImeTypingOptions)
      .values({ userId: user.id, ...input })
      .onConflictDoUpdate({ target: [UserImeTypingOptions.userId], set: { ...input } });
  }),
} satisfies TRPCRouterRecord;
