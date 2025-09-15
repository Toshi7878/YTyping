import z from "zod";
import { eq } from "drizzle-orm";
import { schema } from "@/server/drizzle/client";
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
        .select({ name: schema.users.name })
        .from(schema.users)
        .where(eq(schema.users.id, input.userId))
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
          name: schema.users.name,
          finger_chart_url: schema.userProfiles.fingerChartUrl,
          my_keyboard: schema.userProfiles.myKeyboard,
        })
        .from(schema.users)
        .leftJoin(schema.userProfiles, eq(schema.userProfiles.userId, schema.users.id))
        .where(eq(schema.users.id, input.userId))
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
