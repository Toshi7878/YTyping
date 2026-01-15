import type { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UserOptions } from "@/server/drizzle/schema";
import { CreateUserOptionSchema } from "@/validator/user-option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;
    if (!user) return null;

    const userOption = await db.query.UserOptions.findFirst({
      columns: {
        mapLikeNotify: false,
        userId: false,
        overTakeNotify: false,
      },
      where: eq(UserOptions.userId, user.id),
    });

    return userOption ?? null;
  }),

  upsert: protectedProcedure.input(CreateUserOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { customUserActiveState, hideUserStats } = input;

    await db
      .insert(UserOptions)
      .values({ userId: user.id, customUserActiveState, hideUserStats })
      .onConflictDoUpdate({ target: [UserOptions.userId], set: { customUserActiveState, hideUserStats } })
      .returning({
        customUserActiveState: UserOptions.customUserActiveState,
        hideUserStats: UserOptions.hideUserStats,
      });
  }),
} satisfies TRPCRouterRecord;
