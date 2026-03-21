import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UserTypingOptions } from "@/server/drizzle/schema";
import { CreateUserTypingOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userTypingOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    if (!session) return null;

    return (
      (await db.query.UserTypingOptions.findFirst({
        columns: { userId: false },
        where: eq(UserTypingOptions.userId, session.user.id),
      })) ?? null
    );
  }),

  upsert: protectedProcedure.input(CreateUserTypingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    await db
      .insert(UserTypingOptions)
      .values({ userId: session.user.id, ...input })
      .onConflictDoUpdate({ target: [UserTypingOptions.userId], set: { ...input } });
  }),
} satisfies TRPCRouterRecord;
