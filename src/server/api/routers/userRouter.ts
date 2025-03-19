import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userRouter = {
  getUser: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      const user = await db.users.findUnique({
        where: { id: input.userId },
        select: {
          name: true,
        },
      });

      return user;
    }),
};
