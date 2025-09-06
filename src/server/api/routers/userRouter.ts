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
      return await ctx.db.users.findUnique({
        where: { id: input.userId },
        select: {
          name: true,
        },
      });
    }),

  getUserProfile: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      return await db.users.findUnique({
        where: { id: input.userId },
        select: {
          name: true,
          user_profiles: {
            select: {
              finger_chart_url: true,
              my_keyboard: true,
            },
          },
        },
      });
    }),
};
