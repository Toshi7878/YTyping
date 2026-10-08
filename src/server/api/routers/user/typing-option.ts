import { userTypingOptions } from "@/server/drizzle/schema";
import { CreateUserTypingOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../orpc";

export const userTypingOptionRouter = {
  getForSession: publicProcedure.handler(async ({ context }) => {
    const { db, session } = context;
    if (!session) return null;

    return (
      (await db.query.userTypingOptions.findFirst({
        columns: { userId: false },
        where: { userId: session.user.id },
      })) ?? null
    );
  }),

  upsert: protectedProcedure.input(CreateUserTypingOptionSchema).handler(async ({ input, context }) => {
    const { db, session } = context;

    await db
      .insert(userTypingOptions)
      .values({ userId: session.user.id, ...input })
      .onConflictDoUpdate({ target: [userTypingOptions.userId], set: { ...input } });
  }),
};
