import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UserOptions } from "@/server/drizzle/schema";
import { UpsertUserOptionSchema } from "@/validator/user-option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    if (!user) return null;

    const userOption = await db.query.UserOptions.findFirst({
      columns: { userId: false },
      where: eq(UserOptions.userId, user.id),
    });

    return userOption ?? null;
  }),

  upsert: protectedProcedure.input(UpsertUserOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db
      .insert(UserOptions)
      .values({ userId: user.id, ...input })
      .onConflictDoUpdate({ target: [UserOptions.userId], set: { ...input } })
      .returning({
        userActiveState: UserOptions.presenceState,
        hideUserStats: UserOptions.hideUserStats,
        mapListLayout: UserOptions.mapListLayout,
      });
  }),
} satisfies TRPCRouterRecord;
