import type { TRPCRouterRecord } from "@trpc/server";
import { userImeTypingOptions } from "@/server/drizzle/schema";
import { CreateUserImeTypingOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userImeTypingOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    if (!session) return null;

    return (
      (await db.query.userImeTypingOptions.findFirst({
        columns: { userId: false },
        where: { userId: session.user.id },
      })) ?? null
    );
  }),

  upsert: protectedProcedure.input(CreateUserImeTypingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    await db
      .insert(userImeTypingOptions)
      .values({ userId: session.user.id, ...input })
      .onConflictDoUpdate({ target: [userImeTypingOptions.userId], set: { ...input } });
  }),
} satisfies TRPCRouterRecord;
