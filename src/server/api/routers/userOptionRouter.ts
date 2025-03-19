import { custom_user_active_state } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../trpc";

export const userOptionRouter = {
  getUserOptions: publicProcedure.query(async ({ ctx }) => {
    const { db, user } = ctx;

    if (!user.id) {
      return null;
    }

    const userOptions = await db.user_options.findUnique({
      where: { user_id: user.id },
      select: { custom_user_active_state: true },
    });

    return userOptions;
  }),

  update: protectedProcedure
    .input(
      z.object({
        custom_user_active_state: z.nativeEnum(custom_user_active_state),
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
