import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, count, eq } from "drizzle-orm";
import z from "zod";
import { NotificationClaps, Notifications, ResultClaps, Results } from "@/server/drizzle/schema";
import { protectedProcedure } from "../../trpc";
import { generateNotificationId } from "../../utils/id";

export const resultClapRouter = {
  toggleClap: protectedProcedure
    .input(z.object({ resultId: z.number(), newState: z.boolean() }))
    .mutation(async ({ input, ctx }) => {
      const { db, user } = ctx;
      const { resultId, newState } = input;

      const payload = await db.transaction(async (tx) => {
        const isFirstClap = await tx.query.ResultClaps.findFirst({
          where: and(eq(ResultClaps.userId, user.id), eq(ResultClaps.resultId, resultId)),
        }).then((res) => !res);

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
          .then((rows) => rows[0]?.c ?? 0);

        const mapId = await tx
          .update(Results)
          .set({ clapCount: newClapCount })
          .where(eq(Results.id, resultId))
          .returning({ mapId: Results.mapId })
          .then((res) => res[0]?.mapId);

        if (!mapId) {
          throw new TRPCError({ code: "PRECONDITION_FAILED" });
        }

        if (isFirstClap) {
          const result = await tx.query.Results.findFirst({
            where: eq(Results.id, resultId),
            columns: { userId: true },
          });

          if (result && result.userId !== user.id) {
            const notificationId = generateNotificationId();

            await tx.insert(Notifications).values({
              id: notificationId,
              recipientId: result.userId,
              type: "CLAP",
            });

            await tx.insert(NotificationClaps).values({
              notificationId,
              clapperId: user.id,
              resultId,
            });
          }
        }

        return { resultId, mapId, hasClapped: newState, clapCount: newClapCount };
      });

      return payload;
    }),
} satisfies TRPCRouterRecord;
