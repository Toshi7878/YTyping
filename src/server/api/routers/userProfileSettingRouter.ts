import { upsertMyKeyboardSchema, userFingerChartUrlSchema, nameSchema as userNameSchema } from "@/validator/schema";
import { z } from "@/validator/z";
import { TRPCError } from "@trpc/server";
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
  isNameAvailable: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const existingUser = await db.users.findFirst({
        where: {
          name: input.name,
          NOT: {
            id: user.id,
          },
        },
        select: {
          id: true,
        },
      });

      // true: 利用可能, false: 既に使用済み
      return !existingUser;
    }),

  upsertFingerChartUrl: protectedProcedure.input(userFingerChartUrlSchema).mutation(async ({ input, ctx }) => {
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
  upsertMyKeyboard: protectedProcedure.input(upsertMyKeyboardSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db.user_profiles.upsert({
      where: { user_id: user.id },
      update: { my_keyboard: input.myKeyboard },
      create: {
        user_id: user.id,
        my_keyboard: input.myKeyboard,
      },
    });

    return input.myKeyboard;
  }),
};
