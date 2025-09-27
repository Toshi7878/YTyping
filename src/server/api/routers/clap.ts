import { and, count, eq } from "drizzle-orm";
import z from "zod";
import { ResultClaps, Results } from "@/server/drizzle/schema";
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
          .values({ userId: user.id, resultId, hasClapped: true })
          .onConflictDoUpdate({
            target: [ResultClaps.userId, ResultClaps.resultId],
            set: { hasClapped: newState },
          })
          .returning({ hasClapped: ResultClaps.hasClapped });

        const newClapCount = await tx
          .select({ c: count() })
          .from(ResultClaps)
          .where(and(eq(ResultClaps.resultId, resultId), eq(ResultClaps.hasClapped, true)))
          .then((rows) => rows[0]?.c);

        const mapId = await tx
          .update(Results)
          .set({ clapCount: newClapCount })
          .where(eq(Results.id, resultId))
          .returning({ mapId: Results.mapId })
          .then((res) => res[0].mapId);

        return { resultId, mapId, hasClapped: newState, clapCount: newClapCount };
      });

      return payload;
    }),
};
