import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { userProfiles, users } from "@/server/drizzle/schema";
import { FingerChartUrlApiSchema, keyboardApiSchema } from "@/validator/user/profile";
import { protectedProcedure, publicProcedure } from "../../orpc";

export const userProfileRouter = {
  get: publicProcedure.input(z.object({ userId: z.number() })).handler(async ({ input, context }) => {
    const { db } = context;
    const userProfile = await db
      .select({
        name: users.name,
        banned: users.banned,
        warningCount: users.warningCount,
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

  checkUsernameAvailability: protectedProcedure.input(z.string().min(1)).handler(async ({ input, context }) => {
    const { db, session } = context;
    const existing = await db.query.users
      .findFirst({
        columns: { name: true },
        where: { name: input, NOT: { id: session.user.id } },
      })
      .then((res) => !!res?.name);

    if (existing) {
      throw new ORPCError("CONFLICT", { message: "この名前は既に使用されています" });
    }

    return true;
  }),

  upsertFingerChartUrl: protectedProcedure.input(FingerChartUrlApiSchema).handler(async ({ input, context }) => {
    const { db, session } = context;

    await db
      .insert(userProfiles)
      .values({ userId: session.user.id, fingerChartUrl: input })
      .onConflictDoUpdate({ target: [userProfiles.userId], set: { fingerChartUrl: input } });
  }),

  upsertKeyboard: protectedProcedure.input(keyboardApiSchema).handler(async ({ input, context }) => {
    const { db, session } = context;

    await db
      .insert(userProfiles)
      .values({ userId: session.user.id, keyboard: input })
      .onConflictDoUpdate({ target: [userProfiles.userId], set: { keyboard: input } });
  }),
};
