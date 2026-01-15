import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { UserProfiles, Users } from "@/server/drizzle/schema";
import { FingerChartUrlApiSchema, keyboardApiSchema, UserNameSchema } from "@/validator/user-setting";
import { protectedProcedure, publicProcedure } from "../../trpc";

export const userProfileRouter = {
  get: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
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

  updateName: protectedProcedure.input(UserNameSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db.update(Users).set({ name: input.newName }).where(eq(Users.emailHash, user.email_hash));
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
} satisfies TRPCRouterRecord;
