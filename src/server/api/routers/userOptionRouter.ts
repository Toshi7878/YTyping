import { schema } from "@/server/drizzle/client";
import { eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userOptionRouter = {
  getUserOptions: publicProcedure.input(z.object({ userId: z.number().optional() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { userId } = input;
    const targetId = userId ? userId : user.id;

    const rows = await db
      .select({
        custom_user_active_state: schema.UserOptions.customUserActiveState,
        hide_user_stats: schema.UserOptions.hideUserStats,
      })
      .from(schema.UserOptions)
      .where(eq(schema.UserOptions.userId, targetId))
      .limit(1);

    return rows[0] ?? null;
  }),

  update: protectedProcedure
    .input(
      z.object({
        custom_user_active_state: z.enum(schema.customUserActiveStateEnum.enumValues).optional(),
        hide_user_stats: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;

      const values = {
        userId: user.id,
        ...(input.custom_user_active_state !== undefined && {
          customUserActiveState: input.custom_user_active_state,
        }),
        ...(input.hide_user_stats !== undefined && { hideUserStats: input.hide_user_stats }),
      } as const;

      const res = await db
        .insert(schema.UserOptions)
        .values(values)
        .onConflictDoUpdate({ target: [schema.UserOptions.userId], set: { ...values } })
        .returning({
          custom_user_active_state: schema.UserOptions.customUserActiveState,
          hide_user_stats: schema.UserOptions.hideUserStats,
        });

      return res[0] ?? null;
    }),
};
