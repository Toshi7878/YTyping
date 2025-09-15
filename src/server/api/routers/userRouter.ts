import { schema } from "@/server/drizzle/client";
import { eq } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "../trpc";

export const userRouter = {
  getUserName: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const rows = await ctx.db
        .select({ name: schema.Users.name })
        .from(schema.Users)
        .where(eq(schema.Users.id, input.userId))
        .limit(1);
      return rows[0] ?? null;
    }),

  getUserProfile: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      const rows = await db
        .select({
          name: schema.Users.name,
          finger_chart_url: schema.UserProfiles.fingerChartUrl,
          my_keyboard: schema.UserProfiles.myKeyboard,
        })
        .from(schema.Users)
        .leftJoin(schema.UserProfiles, eq(schema.UserProfiles.userId, schema.Users.id))
        .where(eq(schema.Users.id, input.userId))
        .limit(1);

      const row = rows[0];
      if (!row) return;

      const { name, finger_chart_url, my_keyboard } = row;

      return {
        name,
        finger_chart_url: finger_chart_url ?? "",
        my_keyboard: my_keyboard ?? "",
      };
    }),
};
