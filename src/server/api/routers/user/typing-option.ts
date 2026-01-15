import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UserTypingOptions } from "@/server/drizzle/schema";
import { CreateUserTypingOptionSchema } from "@/validator/user-option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userTypingOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    if (!user) return null;

    return (
      (await db.query.UserTypingOptions.findFirst({
        columns: { userId: false },
        where: eq(UserTypingOptions.userId, user.id),
      })) ?? null
    );
  }),

  upsert: protectedProcedure.input(CreateUserTypingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db
      .insert(UserTypingOptions)
      .values({ userId: user.id, ...input })
      .onConflictDoUpdate({ target: [UserTypingOptions.userId], set: { ...input } });
  }),
} satisfies TRPCRouterRecord;
