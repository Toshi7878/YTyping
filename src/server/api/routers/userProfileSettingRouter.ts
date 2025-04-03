import { userFingerChartUrlSchema, nameSchema as userNameSchema } from "@/validator/schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure } from "../trpc";

export const userProfileSettingRouter = {
  updateName: protectedProcedure.input(userNameSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    const email_hash = user.email_hash;
    if (!email_hash) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "ユーザーの認証情報を確認できませんでした。",
      });
    }

    try {
      await db.users.update({
        where: { email_hash },
        data: { name: input.newName },
      });

      return { id: input.newName, title: "名前が更新されました", message: "", status: 200 };
    } catch {
      return { id: "", title: "名前の更新中にエラーが発生しました", message: "", status: 500 };
    }
  }),
  checkNewName: protectedProcedure
    .input(
      z.object({
        newName: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const userName = db.users.findFirst({
        where: {
          name: input.newName,
          NOT: {
            id: user.id,
          },
        },
        select: {
          name: true,
        },
      });

      return userName;
    }),

  updateFingerChartUrl: protectedProcedure.input(userFingerChartUrlSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db.user_profiles.upsert({
      where: { user_id: user.id },
      update: { finger_chart_url: input.url },
      create: {
        user_id: user.id,
        finger_chart_url: input.url,
      },
    });

    return input.url;
  }),
};
