import { schema } from "@/server/drizzle/client";
import { eq } from "drizzle-orm";
import md5 from "md5";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../trpc";

export const authRouter = router({
  registerIfNeeded: publicProcedure.input(z.object({ email: z.string().email() })).mutation(async ({ input, ctx }) => {
    const email_hash = md5(input.email).toString();
    const existed = await ctx.db
      .select({ id: schema.Users.id })
      .from(schema.Users)
      .where(eq(schema.Users.emailHash, email_hash))
      .limit(1);
    if (existed.length > 0) return true;

    await ctx.db.insert(schema.Users).values({
      emailHash: email_hash,
      name: null,
      role: "USER",
    });

    return true;
  }),

  getSession: protectedProcedure.query(async ({ ctx }) => {
    const userId = Number(ctx.user?.id);
    if (!userId) return null;
    const users = await ctx.db
      .select({
        id: schema.Users.id,
        name: schema.Users.name,
        role: schema.Users.role,
        emailHash: schema.Users.emailHash,
      })
      .from(schema.Users)
      .where(eq(schema.Users.id, userId))
      .limit(1);
    const user = users[0];
    if (!user) return null;
    return {
      id: user.id,
      name: user.name,
      role: user.role,
      email_hash: user.emailHash,
    };
  }),
});
