import { UserProfiles, Users } from "@/server/drizzle/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "../trpc";

export const userRouter = {
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

  getUserProfile: publicProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db } = ctx;
    const userProfile = await db
      .select({
        name: Users.name,
        fingerChartUrl: UserProfiles.fingerChartUrl,
        myKeyboard: UserProfiles.myKeyboard,
      })
      .from(UserProfiles)
      .innerJoin(Users, eq(Users.id, input.userId))
      .where(eq(UserProfiles.userId, input.userId))
      .limit(1)
      .then((rows) => rows[0]);

    if (!userProfile) {
      throw new TRPCError({ code: "NOT_FOUND" });
    }

    return userProfile;
  }),
};
