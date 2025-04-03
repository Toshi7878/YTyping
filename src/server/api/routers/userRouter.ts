import { z } from "@/validator/z";
import { publicProcedure } from "../trpc";

export const userRouter = {
  getUserProfile: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
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
