import z from "zod";
import { protectedProcedure } from "../trpc";

export const clapRouter = {
  toggleClap: protectedProcedure
    .input(
      z.object({
        resultId: z.number(),
        optimisticState: z.boolean(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { resultId, optimisticState } = input;

      const payload = await db.$transaction(async (tx) => {
        const claped = await tx.result_claps.upsert({
          where: {
            user_id_result_id: {
              user_id: user.id,
              result_id: resultId,
            },
          },
          update: {
            is_claped: optimisticState,
          },
          create: {
            user_id: user.id,
            result_id: resultId,
            is_claped: true,
          },
        });

        const newClapCount = await tx.result_claps.count({
          where: {
            result_id: resultId,
            is_claped: true,
          },
        });

        await tx.results.update({
          where: {
            id: resultId,
          },
          data: {
            clap_count: newClapCount,
          },
        });

        return { resultId, isClaped: claped.is_claped, clapCount: newClapCount };
      });

      return payload;
    }),
};
