import { userImeTypingOptions } from "@/server/drizzle/schema";
import { CreateUserImeTypingOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../orpc";

export const userImeTypingOptionRouter = {
  getForSession: publicProcedure.handler(async ({ context }) => {
    const { db, session } = context;
    if (!session) return null;

    return (
      (await db.query.userImeTypingOptions.findFirst({
        columns: { userId: false },
        where: { userId: session.user.id },
      })) ?? null
    );
  }),

  upsert: protectedProcedure.input(CreateUserImeTypingOptionSchema).handler(async ({ input, context }) => {
    const { db, session } = context;

    await db
      .insert(userImeTypingOptions)
      .values({ userId: session.user.id, ...input })
      .onConflictDoUpdate({ target: [userImeTypingOptions.userId], set: { ...input } });
  }),
};
