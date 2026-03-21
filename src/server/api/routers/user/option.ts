import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { UserOptions } from "@/server/drizzle/schema";
import { UpsertUserOptionSchema } from "@/validator/user/option";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userOptionRouter = {
  getForSession: publicProcedure.query(async ({ ctx }) => {
    const { db, session } = ctx;
    if (!session) return null;

    const userOption = await db.query.UserOptions.findFirst({
      columns: { userId: false },
      where: eq(UserOptions.userId, session.user.id),
    });

    return userOption ?? null;
  }),

  upsert: protectedProcedure.input(UpsertUserOptionSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    const [newUserOptions] = await db
      .insert(UserOptions)
      .values({ userId: session.user.id, ...input })
      .onConflictDoUpdate({ target: [UserOptions.userId], set: { ...input } })
      .returning({
        presenceState: UserOptions.presenceState,
        hideUserStats: UserOptions.hideUserStats,
        mapListLayout: UserOptions.mapListLayout,
      });

    if (!newUserOptions) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return newUserOptions;
  }),
} satisfies TRPCRouterRecord;
