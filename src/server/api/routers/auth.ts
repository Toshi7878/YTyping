import { ORPCError } from "@orpc/server";
import z from "zod";
import { protectedProcedure } from "../orpc";

export const authRouter = {
  updateName: protectedProcedure.input(z.object({ name: z.string().min(1) })).handler(async ({ context, input }) => {
    try {
      return await context.authApi.updateUser({
        body: input,
        headers: context.headers,
      });
    } catch {
      throw new ORPCError("BAD_REQUEST", { message: "ユーザー情報の更新に失敗しました" });
    }
  }),
};
