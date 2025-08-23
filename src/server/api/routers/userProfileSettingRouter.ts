import { fingerChartUrlApiSchema, myKeyboardApiSchema, nameSchema as userNameSchema } from "@/validator/schema";
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
  isNameAvailable: protectedProcedure.input(z.string().min(1)).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const existingUser = await db.users.findFirst({
      where: {
        name: input,
        NOT: {
          id: user.id,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      throw new TRPCError({
        code: "CONFLICT",
        message: "この名前は既に使用されています",
      });
    }

    // true: 利用可能, false: 既に使用済み
    return !existingUser;
  }),

  upsertFingerChartUrl: protectedProcedure.input(fingerChartUrlApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db.user_profiles.upsert({
      where: { user_id: user.id },
      update: { finger_chart_url: input },
      create: {
        user_id: user.id,
        finger_chart_url: input,
      },
    });

    return input;
  }),
  upsertMyKeyboard: protectedProcedure.input(myKeyboardApiSchema).mutation(async ({ input, ctx }) => {
    const { db, user } = ctx;

    await db.user_profiles.upsert({
      where: { user_id: user.id },
      update: { my_keyboard: input },
      create: {
        user_id: user.id,
        my_keyboard: input,
      },
    });

    return input;
  }),
};
