import { auth } from "@/server/auth";
import { prisma } from "@/server/db";
import { nameSchema as userNameSchema } from "@/validator/schema";
import { z } from "zod";
import { publicProcedure } from "../trpc";

export const userProfileSettingRouter = {
  updateName: publicProcedure.input(userNameSchema).mutation(async ({ input }) => {
    try {
      const session = await auth();
      const email_hash = session?.user?.email;

      if (email_hash) {
        await prisma.users.update({
          where: { email_hash },
          data: { name: input.newName },
        });
      }
      return { id: input.newName, title: "名前が更新されました", message: "", status: 200 };
    } catch {
      return { id: "", title: "名前の更新中にエラーが発生しました", message: "", status: 500 };
    }
  }),
  checkNewName: publicProcedure
    .input(
      z.object({
        newName: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const session = await auth();
      const userName = prisma.users.findFirst({
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
