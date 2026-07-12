import type { TRPCRouterRecord } from "@trpc/server";
import { and, count, eq, gt, sql } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "@/server/api/trpc";
import { userStats, users } from "@/server/drizzle/schema";
import type { PpMode } from "@/shared/result/pp/mode";
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

  getRanksByUserId: publicProcedure.input(z.number().int()).query(async ({ input, ctx }) => {
    const { db } = ctx;

    const emptyRanks: Record<PpMode, number | null> = {
      total: null,
      roma: null,
      kana: null,
      flick: null,
      english: null,
    };

    const me = await db.query.userStats.findFirst({
      columns: { totalPp: true, romaPp: true, kanaPp: true, flickPp: true, englishPp: true },
      where: { userId: input },
    });
    if (!me) return emptyRanks;

    const aboveCounts = await db
      .select({
        total: sql<number>`count(*) filter (where ${userStats.totalPp} > ${me.totalPp})`.mapWith(Number),
        roma: sql<number>`count(*) filter (where ${userStats.romaPp} > ${me.romaPp})`.mapWith(Number),
        kana: sql<number>`count(*) filter (where ${userStats.kanaPp} > ${me.kanaPp})`.mapWith(Number),
        flick: sql<number>`count(*) filter (where ${userStats.flickPp} > ${me.flickPp})`.mapWith(Number),
        english: sql<number>`count(*) filter (where ${userStats.englishPp} > ${me.englishPp})`.mapWith(Number),
      })
      .from(userStats)
      .innerJoin(users, eq(users.id, userStats.userId))
      .where(eq(users.banned, false))
      .then((rows) => rows[0]);
    if (!aboveCounts) return emptyRanks;

    return {
      total: me.totalPp > 0 ? aboveCounts.total + 1 : null,
      roma: me.romaPp > 0 ? aboveCounts.roma + 1 : null,
      kana: me.kanaPp > 0 ? aboveCounts.kana + 1 : null,
      flick: me.flickPp > 0 ? aboveCounts.flick + 1 : null,
      english: me.englishPp > 0 ? aboveCounts.english + 1 : null,
    } satisfies Record<PpMode, number | null>;
  }),

  list: rankingPpListRouter,
} satisfies TRPCRouterRecord;
