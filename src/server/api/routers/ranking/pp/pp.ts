import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, eq, gt } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "@/server/api/trpc";
import { userStats, users } from "@/server/drizzle/schema";
import { rankingPpListRouter } from "./list";

export const rankingPpRouter = {
  getRankByUserId: publicProcedure.input(z.number().int()).query(async ({ input, ctx }) => {
    const { db } = ctx;

    const userRow = await db.query.userStats.findFirst({
      columns: { totalPp: true },
      where: { userId: input },
    });

    if (!userRow) {
      return db
        .select({ count: count() })
        .from(userStats)
        .innerJoin(users, eq(users.id, userStats.userId))
        .where(eq(users.banned, false))
        .then((rows) => rows[0]?.count ?? 0);
    }

    const aboveCount = await db
      .select({ count: count() })
      .from(userStats)
      .innerJoin(users, eq(users.id, userStats.userId))
      .where(and(eq(users.banned, false), gt(userStats.totalPp, userRow.totalPp)))
      .then((rows) => rows[0]?.count ?? 0);

    return aboveCount + 1;
  }),

  list: rankingPpListRouter,
} satisfies TRPCRouterRecord;
