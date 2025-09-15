import { schema } from "@/server/drizzle/client";
import { fingerChartUrlApiSchema, myKeyboardApiSchema, nameSchema as userNameSchema } from "@/validator/schema";
import { TRPCError } from "@trpc/server";
import { and, eq, ne } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../trpc";

export const userProfileSettingRouter = {
  updateName: protectedProcedure.input(userNameSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const email_hash = user.email_hash;
    if (!email_hash) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Missing user auth info",
      });
    }

    try {
      await db.update(schema.Users).set({ name: input.newName }).where(eq(schema.Users.emailHash, email_hash));

      return { id: input.newName, title: "Name updated", message: "", status: 200 };
    } catch {
      return { id: "", title: "Failed to update name", message: "", status: 500 };
    }
  }),
  isNameAvailable: protectedProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const existing = await db
      .select({ id: schema.Users.id })
      .from(schema.Users)
      .where(and(eq(schema.Users.name, input), ne(schema.Users.id, user.id)))
      .limit(1);

    if (existing.length > 0) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "Name already in use",
      });
    }

    // true: available, false: taken
    return true;
  }),

  upsertFingerChartUrl: protectedProcedure.input(fingerChartUrlApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db
      .insert(schema.UserProfiles)
      .values({ userId: user.id, fingerChartUrl: input, myKeyboard: "" })
      .onConflictDoUpdate({ target: [schema.UserProfiles.userId], set: { fingerChartUrl: input } });

    return input;
  }),
  upsertMyKeyboard: protectedProcedure.input(myKeyboardApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db
      .insert(schema.UserProfiles)
      .values({ userId: user.id, myKeyboard: input, fingerChartUrl: "" })
      .onConflictDoUpdate({ target: [schema.UserProfiles.userId], set: { myKeyboard: input } });

    return input;
  }),
};
