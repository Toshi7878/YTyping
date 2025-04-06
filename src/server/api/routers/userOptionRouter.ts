import { z } from "@/validator/z";
import { custom_user_active_state } from "@prisma/client";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userOptionRouter = {
  getUserOptions: publicProcedure.input(z.object({ userId: z.number().optional() })).query(async ({ input, ctx }) => {
    const { db, user } = ctx;
    const { userId } = input;

    const userOptions = await db.user_options.findUnique({
      where: { user_id: userId ? userId : user.id },
      select: { custom_user_active_state: true, hide_user_stats: true },
    });

    return userOptions;
  }),

  update: protectedProcedure
    .input(
      z.object({
        custom_user_active_state: z.nativeEnum(custom_user_active_state).optional(),
        hide_user_stats: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;

      const updated = await db.user_options.upsert({
        where: {
          user_id: user.id,
        },
        update: {
          ...input,
        },
        create: {
          user_id: user.id,
          ...input,
        },
      });

      return updated;
    }),
};
