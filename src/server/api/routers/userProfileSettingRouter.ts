import { prisma } from "@/server/db";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userProfileSettingRouter = {
  checkNewName: publicProcedure
    .input(
      z.object({
        newName: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const userName = prisma.user.findUnique({
        where: {
          name: input.newName,
        },
        select: {
          name: true,
        },
      });

      return userName;
    }),
};
