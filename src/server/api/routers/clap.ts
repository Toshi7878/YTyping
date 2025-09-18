import { ResultClaps, Results } from "@/server/drizzle/schema";
import { and, count, eq } from "drizzle-orm";
import z from "zod";
import { protectedProcedure } from "../trpc";

export const clapRouter = {
  toggleClap: protectedProcedure
    .input(z.object({ resultId: z.number(), newState: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { resultId, newState } = input;

      const payload = await db.transaction(async (tx) => {
        await tx
          .insert(ResultClaps)
          .values({ userId: user.id, resultId, isClaped: true })
          .onConflictDoUpdate({
            target: [ResultClaps.userId, ResultClaps.resultId],
            set: { isClaped: newState },
          })
          .returning({ isClaped: ResultClaps.isClaped });

        const newClapCount = await tx
          .select({ c: count() })
          .from(ResultClaps)
          .where(and(eq(ResultClaps.resultId, resultId), eq(ResultClaps.isClaped, true)))
          .then((rows) => rows[0]?.c);

        await tx.update(Results).set({ clapCount: newClapCount }).where(eq(Results.id, resultId));

        return { resultId, isClaped: newState, clapCount: newClapCount };
      });

      return payload;
    }),
};
