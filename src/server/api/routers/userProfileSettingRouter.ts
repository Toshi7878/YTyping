import { auth } from "@/server/auth";
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
    .mutation(async ({ input }) => {
      const session = await auth();
      const userName = prisma.user.findFirst({
        where: {
          name: input.newName,
          NOT: {
            id: session ? Number(session.user.id) : 0,
          },
        },
        select: {
          name: true,
        },
      });

      return userName;
    }),
};
