import { UserProfiles, Users } from "@/server/drizzle/schema";
import { FingerChartUrlApiSchema, MyKeyboardApiSchema, UserNameSchema } from "@/server/drizzle/validator/user-setting";
import { TRPCError } from "@trpc/server";
import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../trpc";

export const userProfileSettingRouter = {
  updateName: protectedProcedure.input(UserNameSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const email_hash = user.email_hash;
    if (!email_hash) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing user auth info",
      });
    }

    await db.update(Users).set({ name: input.newName }).where(eq(Users.emailHash, email_hash));
    return input.newName;
  }),

  isNameAvailable: protectedProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const existing = await db.query.Users.findFirst({
      columns: { name: true },
      where: and(eq(Users.name, input), ne(Users.id, user.id)),
    }).then((res) => !!res?.name);

    if (existing) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Name already in use",
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

  upsertMyKeyboard: protectedProcedure.input(MyKeyboardApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db
      .insert(UserProfiles)
      .values({ userId: user.id, myKeyboard: input })
      .onConflictDoUpdate({ target: [UserProfiles.userId], set: { myKeyboard: input } });
  }),
};
