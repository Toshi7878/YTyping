import { ORPCError } from "@orpc/server";
import { userOptions } from "@/server/drizzle/schema";
import { UpsertUserOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../orpc";

export const userOptionRouter = {
  getForSession: publicProcedure.handler(async ({ context }) => {
    const { db, session } = context;
    if (!session) return null;

    const userOption = await db.query.userOptions.findFirst({
      columns: { userId: false },
      where: { userId: session.user.id },
    });

    return userOption ?? null;
  }),

  upsert: protectedProcedure.input(UpsertUserOptionSchema).handler(async ({ input, context }) => {
    const { db, session } = context;

    const [newuserOptions] = await db
      .insert(userOptions)
      .values({ userId: session.user.id, ...input })
      .onConflictDoUpdate({ target: [userOptions.userId], set: { ...input } })
      .returning({
        presenceState: userOptions.presenceState,
        hideUserStats: userOptions.hideUserStats,
        mapListLayout: userOptions.mapListLayout,
      });

    if (!newuserOptions) {
      throw new ORPCError("NOT_FOUND");
    }

    return newuserOptions;
  }),
};
