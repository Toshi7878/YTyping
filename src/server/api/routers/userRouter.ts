import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userRouter = {
  getUser: publicProcedure
    .input(
      z.object({
        userId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const user = await prisma.users.findUnique({
        where: { id: input.userId },
        select: {
          name: true,
        },
      });

      return user;
    }),
};
