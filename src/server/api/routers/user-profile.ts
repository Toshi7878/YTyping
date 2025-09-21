import { UserProfiles, Users } from "@/server/drizzle/schema";
import { FingerChartUrlApiSchema, keyboardApiSchema, UserNameSchema } from "@/server/drizzle/validator/user-setting";
import { TRPCError } from "@trpc/server";
import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userProfileRouter = {
  getUserProfile: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;
    const userProfile = await db
      .select({
        name: Users.name,
        fingerChartUrl: UserProfiles.fingerChartUrl,
        keyboard: UserProfiles.keyboard,
      })
      .from(Users)
      .leftJoin(UserProfiles, eq(UserProfiles.userId, input.userId))
      .where(eq(Users.id, input.userId))
      .limit(1)
      .then((rows) => rows[0]);

    return userProfile;
  }),
  getUserName: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const userName = await ctx.db.query.Users.findFirst({
      columns: { name: true },
      where: eq(Users.id, input.userId),
    }).then((res) => res?.name);

    if (!userName) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return userName;
  }),
  updateName: protectedProcedure.input(UserNameSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { email_hash } = user;

    if (!email_hash) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing user auth info",
      });
    }

    await db.update(Users).set({ name: input.newName }).where(eq(Users.emailHash, email_hash));
    return input.newName;
  }),

  checkUsernameAvailability: protectedProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const existing = await db.query.Users.findFirst({
      columns: { name: true },
      where: and(eq(Users.name, input), ne(Users.id, user.id)),
    }).then((res) => !!res?.name);

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "この名前は既に使用されています",
      });
    }

    return true;
  }),

  upsertFingerChartUrl: protectedProcedure.input(FingerChartUrlApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db
      .insert(UserProfiles)
      .values({ userId: user.id, fingerChartUrl: input })
      .onConflictDoUpdate({ target: [UserProfiles.userId], set: { fingerChartUrl: input } });
  }),

  upsertKeyboard: protectedProcedure.input(keyboardApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db
      .insert(UserProfiles)
      .values({ userId: user.id, keyboard: input })
      .onConflictDoUpdate({ target: [UserProfiles.userId], set: { keyboard: input } });
  }),
};
