import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import z from "zod";
import { protectedProcedure } from "../trpc";

export const authRouter = {
  updateName: protectedProcedure.input(z.object({ name: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    try {
      return await ctx.authApi.updateUser({
        body: input,
        headers: ctx.headers,
      });
    } catch {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "ユーザー情報の更新に失敗しました",
      });
    }
  }),
} satisfies TRPCRouterRecord;
