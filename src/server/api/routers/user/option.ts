import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { userOptions } from "@/server/drizzle/schema";
import { UpsertUserOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    if (!session) return null;

    const userOption = await db.query.userOptions.findFirst({
      columns: { userId: false },
      where: { userId: session.user.id },
    });

    return userOption ?? null;
  }),

  upsert: protectedProcedure.input(UpsertUserOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

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
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return newuserOptions;
  }),
} satisfies TRPCRouterRecord;
