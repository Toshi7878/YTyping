import { ORPCError } from "@orpc/server";
import { and, count, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import type { DBType } from "@/server/drizzle/client";
import { notificationClaps, notifications, resultClaps, results } from "@/server/drizzle/schema";
import { type ORPCContext, protectedProcedure } from "../../orpc";
import { generateNotificationId } from "../notification";

export const resultClapRouter = {
  toggleClap: protectedProcedure
    .input(z.object({ resultId: z.number(), newState: z.boolean() }))
    .handler(async ({ input, context }) => {
      const { db, session } = context;
      const { resultId, newState } = input;

      const payload = await db.transaction(async (tx) => {
        const isFirstClap = await tx.query.resultClaps
          .findFirst({
            where: { userId: session.user.id, resultId },
          })
          .then((res) => !res);

        await tx
          .insert(resultClaps)
          .values({ userId: session.user.id, resultId, hasClapped: true })
          .onConflictDoUpdate({
            target: [resultClaps.userId, resultClaps.resultId],
            set: { hasClapped: newState },
          })
          .returning({ hasClapped: resultClaps.hasClapped });

        const newClapCount = await tx
          .select({ c: count() })
          .from(resultClaps)
          .where(and(eq(resultClaps.resultId, resultId), eq(resultClaps.hasClapped, true)))
          .then((rows) => rows[0]?.c ?? 0);

        const mapId = await tx
          .update(results)
          .set({ clapCount: newClapCount })
          .where(eq(results.id, resultId))
          .returning({ mapId: results.mapId })
          .then((res) => res[0]?.mapId);

        if (!mapId) {
          throw new ORPCError("PRECONDITION_FAILED");
        }

        if (isFirstClap) {
          const result = await tx.query.results.findFirst({
            where: { id: resultId },
            columns: { userId: true },
          });

          if (result && result.userId !== session.user.id) {
            const notificationId = generateNotificationId();

            await tx.insert(notifications).values({
              id: notificationId,
              recipientId: result.userId,
              type: "CLAP",
            });

            await tx.insert(notificationClaps).values({
              notificationId,
              clapperId: session.user.id,
              resultId,
            });
          }
        }

        return { resultId, mapId, hasClapped: newState, clapCount: newClapCount };
      });

      return payload;
    }),
};

export const getRankingClapCounts = async (db: DBType, session: ORPCContext["session"], mapId: number) => {
  if (session) {
    const myClap = alias(resultClaps, "my_clap");

    return await db
      .select({
        resultId: results.id,
        clapCount: results.clapCount,
        hasClapped: session ? sql`COALESCE(${myClap.hasClapped}, false)`.mapWith(Boolean) : sql`0`.mapWith(Boolean),
      })
      .from(results)
      .leftJoin(myClap, and(eq(myClap.resultId, results.id), eq(myClap.userId, session.user.id)))
      .where(and(eq(results.mapId, mapId)));
  }
  return await db
    .select({ resultId: results.id, clapCount: results.clapCount, hasClapped: sql`0`.mapWith(Boolean) })
    .from(results)
    .where(and(eq(results.mapId, mapId)));
};
