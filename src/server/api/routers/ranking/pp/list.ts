import type { TRPCRouterRecord } from "@trpc/server";
import { and, asc, count, desc, eq, gt, sql } from "drizzle-orm";
import z from "zod";
import { publicProcedure } from "@/server/api/trpc";
import { createPagination } from "@/server/api/utils/pagination";
import { userStats, users } from "@/server/drizzle/schema";
import { PP_MODES } from "@/shared/result/pp/mode";
import { PAGE_SIZE, PP_MODE_COLUMNS } from "./const";

export const rankingPpListRouter = {
  get: publicProcedure
    .input(z.object({ cursor: z.number().int().optional(), mode: z.enum(PP_MODES).default("total") }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      const { mode } = input;
      const column = PP_MODE_COLUMNS[mode];

      const { offset, limit, buildPageResult } = createPagination(input.cursor, PAGE_SIZE);

      const rows = await db
        .select({
          userId: users.id,
          name: users.name,
          pp: column,
          rank: sql<number>`RANK() OVER (ORDER BY ${column} DESC)`,
        })
        .from(userStats)
        .innerJoin(users, eq(users.id, userStats.userId))
        .where(mode === "total" ? eq(users.banned, false) : and(eq(users.banned, false), gt(column, 0)))
        .orderBy(desc(column), asc(users.id))
        .limit(limit)
        .offset(offset);

      return buildPageResult(rows);
    }),

  getPageCount: publicProcedure
    .input(z.object({ mode: z.enum(PP_MODES).default("total") }))
    .query(async ({ input, ctx }) => {
      const { db } = ctx;
      const { mode } = input;
      const column = PP_MODE_COLUMNS[mode];

      const result = await db
        .select({ count: count() })
        .from(userStats)
        .innerJoin(users, eq(users.id, userStats.userId))
        .where(mode === "total" ? eq(users.banned, false) : and(eq(users.banned, false), gt(column, 0)));

      const total = result[0]?.count ?? 0;
      return Math.ceil(total / PAGE_SIZE);
    }),
} satisfies TRPCRouterRecord;
