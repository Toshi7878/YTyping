import type { TRPCRouterRecord } from "@trpc/server";
import { asc, count, desc, eq, sql } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "@/server/api/trpc";
import { createPagination } from "@/server/api/utils/pagination";
import { userStats, users } from "@/server/drizzle/schema";
import { PAGE_SIZE } from "./const";

export const rankingPpListRouter = {
  get: publicProcedure.input(z.object({ cursor: z.number().int().optional() })).query(async ({ input, ctx }) => {
    const { db } = ctx;

    const { offset, limit, buildPageResult } = createPagination(input.cursor, PAGE_SIZE);

    const rows = await db
      .select({
        userId: users.id,
        name: users.name,
        totalPP: userStats.totalPp,
        rank: sql<number>`RANK() OVER (ORDER BY ${userStats.totalPp} DESC)`,
      })
      .from(userStats)
      .innerJoin(users, eq(users.id, userStats.userId))
      .where(eq(users.banned, false))
      .orderBy(desc(userStats.totalPp), asc(users.id))
      .limit(limit)
      .offset(offset);

    return buildPageResult(rows);
  }),

  getPageCount: publicProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    const result = await db
      .select({ count: count() })
      .from(userStats)
      .innerJoin(users, eq(users.id, userStats.userId))
      .where(eq(users.banned, false));

    const total = result[0]?.count ?? 0;
    return Math.ceil(total / PAGE_SIZE);
  }),
} satisfies TRPCRouterRecord;
