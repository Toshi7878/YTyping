import { schema } from "@/server/drizzle/client";
import { and, count, eq } from "drizzle-orm";
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

      const payload = await db.transaction(async (tx) => {
        const res = await tx
          .insert(schema.ResultClaps)
          .values({ userId: user.id, resultId, isClaped: true })
          .onConflictDoUpdate({
            target: [schema.ResultClaps.userId, schema.ResultClaps.resultId],
            set: { isClaped: optimisticState },
          })
          .returning({ is_claped: schema.ResultClaps.isClaped });

        const newClapCountRow = await tx
          .select({ c: count() })
          .from(schema.ResultClaps)
          .where(and(eq(schema.ResultClaps.resultId, resultId), eq(schema.ResultClaps.isClaped, true)));
        const newClapCount = newClapCountRow[0]?.c ?? 0;

        await tx.update(schema.Results).set({ clapCount: newClapCount }).where(eq(schema.Results.id, resultId));

        return { resultId, isClaped: res[0]?.is_claped ?? optimisticState, clapCount: newClapCount };
      });

      return payload;
    }),
};
