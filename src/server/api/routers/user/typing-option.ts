import type { TRPCRouterRecord } from "@trpc/server";
import { userTypingOptions } from "@/server/drizzle/schema";
import { CreateUserTypingOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userTypingOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    if (!session) return null;

    return (
      (await db.query.userTypingOptions.findFirst({
        columns: { userId: false },
        where: { userId: session.user.id },
      })) ?? null
    );
  }),

  upsert: protectedProcedure.input(CreateUserTypingOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    await db
      .insert(userTypingOptions)
      .values({ userId: session.user.id, ...input })
      .onConflictDoUpdate({ target: [userTypingOptions.userId], set: { ...input } });
  }),
} satisfies TRPCRouterRecord;
