import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UserImeTypingOptions } from "@/server/drizzle/schema";
import { CreateUserImeTypingOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userImeTypingOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    if (!session) return null;

    return (
      (await db.query.UserImeTypingOptions.findFirst({
        columns: { userId: false },
        where: eq(UserImeTypingOptions.userId, session.user.id),
      })) ?? null
    );
  }),

  upsert: protectedProcedure.input(CreateUserImeTypingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    await db
      .insert(UserImeTypingOptions)
      .values({ userId: session.user.id, ...input })
      .onConflictDoUpdate({ target: [UserImeTypingOptions.userId], set: { ...input } });
  }),
} satisfies TRPCRouterRecord;
