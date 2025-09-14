import { MD5 } from "crypto-js";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
  registerIfNeeded: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input, ctx }) => {
    const email_hash = MD5(input.email).toString();
    const existed = await ctx.db.users.findUnique({ where: { email_hash } });
    if (existed) return true;

    await ctx.db.users.create({
      data: {
        email_hash,
        name: null,
        role: "USER",
      },
    });

    return true;
  }),

  getSession: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.user?.id);
    if (!userId) return null;
    const user = await ctx.db.users.findUnique({ where: { id: userId } });
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email_hash: user.email_hash,
    };
  }),
});
