import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { userProfiles, users } from "@/server/drizzle/schema";
import { FingerChartUrlApiSchema, keyboardApiSchema } from "@/validator/user/profile";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userProfileRouter = {
  get: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;
    const userProfile = await db
      .select({
        name: users.name,
        fingerChartUrl: userProfiles.fingerChartUrl,
        keyboard: userProfiles.keyboard,
      })
      .from(users)
      .leftJoin(userProfiles, eq(userProfiles.userId, input.userId))
      .where(eq(users.id, input.userId))
      .limit(1)
      .then((rows) => rows[0]);

    return userProfile;
  }),

  checkUsernameAvailability: protectedProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const existing = await db.query.users
      .findFirst({
        columns: { name: true },
        where: { name: input, NOT: { id: session.user.id } },
      })
      .then((res) => !!res?.name);

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "この名前は既に使用されています",
      });
    }

    return true;
  }),

  upsertFingerChartUrl: protectedProcedure.input(FingerChartUrlApiSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    await db
      .insert(userProfiles)
      .values({ userId: session.user.id, fingerChartUrl: input })
      .onConflictDoUpdate({ target: [userProfiles.userId], set: { fingerChartUrl: input } });
  }),

  upsertKeyboard: protectedProcedure.input(keyboardApiSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;

    await db
      .insert(userProfiles)
      .values({ userId: session.user.id, keyboard: input })
      .onConflictDoUpdate({ target: [userProfiles.userId], set: { keyboard: input } });
  }),
} satisfies TRPCRouterRecord;
