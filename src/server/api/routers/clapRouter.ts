import z from "zod";
import { and, count, eq } from "drizzle-orm";
import { schema } from "@/server/drizzle/client";
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
          .insert(schema.resultClaps)
          .values({ userId: user.id, resultId, isClaped: true })
          .onConflictDoUpdate({ target: [schema.resultClaps.userId, schema.resultClaps.resultId], set: { isClaped: optimisticState } })
          .returning({ is_claped: schema.resultClaps.isClaped });

        const newClapCountRow = await tx
          .select({ c: count() })
          .from(schema.resultClaps)
          .where(and(eq(schema.resultClaps.resultId, resultId), eq(schema.resultClaps.isClaped, true)));
        const newClapCount = newClapCountRow[0]?.c ?? 0;

        await tx.update(schema.results).set({ clapCount: newClapCount }).where(eq(schema.results.id, resultId));

        return { resultId, isClaped: res[0]?.is_claped ?? optimisticState, clapCount: newClapCount };
      });

      return payload;
    }),
};
