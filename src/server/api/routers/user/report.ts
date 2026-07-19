import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import z from "zod";
import type { TXType } from "@/server/drizzle/client";
import {
  maps,
  notificationReportResults,
  notifications,
  notificationWarnings,
  resultStatuses,
  results,
  userReports,
  users,
} from "@/server/drizzle/schema";
import { userReportApiSchema, userReportWarningApiSchema } from "@/validator/user/report";
import { adminProcedure, protectedProcedure } from "../../trpc";
import { generateNotificationId } from "../notification";

export const userReportRouter = {
  submit: protectedProcedure.input(userReportApiSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { reportedUserId, reason, reasonDetail } = input;

    if (session.user.id === reportedUserId) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "自分自身を報告することはできません" });
    }

    const target = await db.query.users.findFirst({
      columns: { id: true },
      where: { id: reportedUserId },
    });

    if (!target) {
      throw new TRPCError({ code: "NOT_FOUND", message: "ユーザーが見つかりません" });
    }

    const existing = await db.query.userReports.findFirst({
      columns: { id: true },
      where: { reporterId: session.user.id, reportedUserId, status: "PENDING" },
    });

    if (existing) {
      throw new TRPCError({ code: "CONFLICT", message: "このユーザーへの報告は既に受け付けています" });
    }

    await db.insert(userReports).values({
      reporterId: session.user.id,
      reportedUserId,
      reason,
      reasonDetail,
    });
  }),

  ban: adminProcedure
    .input(
      z.object({
        reportId: z.number(),
        adminNote: z.string().min(1).max(1000),
        banReason: z.string().max(500).optional(),
        banExpires: z.date().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;
      const { reportId, adminNote, banReason, banExpires } = input;

      const report = await db.query.userReports.findFirst({
        columns: { id: true, reporterId: true, reportedUserId: true, status: true },
        where: { id: reportId },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "報告が見つかりません" });
      }

      if (report.status !== "PENDING") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "この報告は既に処理済みです" });
      }

      await db.transaction(async (tx) => {
        await tx
          .update(userReports)
          .set({
            status: "RESOLVED",
            adminNote,
            resolvedBy: session.user.id,
            resolvedAt: new Date(),
          })
          .where(eq(userReports.id, reportId));

        await tx
          .update(users)
          .set({ banned: true, banReason, banExpires: banExpires ?? null })
          .where(eq(users.id, report.reportedUserId));

        await recalculateRanksForBannedUser(tx, report.reportedUserId);
        await createReportResultNotification(tx, { recipientId: report.reporterId, reportId });
      });
    }),

  dismiss: adminProcedure
    .input(z.object({ reportId: z.number(), adminNote: z.string().max(1000).optional() }))
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;
      const { reportId, adminNote } = input;

      const report = await db.query.userReports.findFirst({
        columns: { id: true, reporterId: true, status: true },
        where: { id: reportId },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "報告が見つかりません" });
      }

      if (report.status !== "PENDING") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "この報告は既に処理済みです" });
      }

      await db.transaction(async (tx) => {
        await tx
          .update(userReports)
          .set({
            status: "DISMISSED",
            adminNote,
            resolvedBy: session.user.id,
            resolvedAt: new Date(),
          })
          .where(eq(userReports.id, reportId));

        if (adminNote) {
          await createReportResultNotification(tx, { recipientId: report.reporterId, reportId });
        }
      });
    }),

  warn: adminProcedure.input(userReportWarningApiSchema).mutation(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { reportId, warningComment, adminNote } = input;

    const report = await db.query.userReports.findFirst({
      columns: { id: true, reporterId: true, reportedUserId: true, status: true },
      where: { id: reportId },
    });

    if (!report) {
      throw new TRPCError({ code: "NOT_FOUND", message: "通報が見つかりません" });
    }

    if (report.status !== "PENDING") {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "この通報は既に処理済みです" });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(userReports)
        .set({
          status: "WARNED",
          adminNote,
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        })
        .where(eq(userReports.id, reportId));

      await tx
        .update(users)
        .set({ warningCount: sql`${users.warningCount} + 1` })
        .where(eq(users.id, report.reportedUserId));

      await createWarningNotification(tx, {
        recipientId: report.reportedUserId,
        reportId,
        comment: warningComment,
      });
      await createReportResultNotification(tx, { recipientId: report.reporterId, reportId });
    });
  }),

  unban: adminProcedure.input(z.object({ reportId: z.number() })).mutation(async ({ input, ctx }) => {
    const { db } = ctx;
    const { reportId } = input;

    const report = await db.query.userReports.findFirst({
      columns: { id: true, reportedUserId: true, status: true },
      where: { id: reportId },
      with: {
        reportedUser: { columns: { banned: true } },
      },
    });

    if (!report) {
      throw new TRPCError({ code: "NOT_FOUND", message: "通報が見つかりません" });
    }

    if (report.status !== "RESOLVED" || !report.reportedUser.banned) {
      throw new TRPCError({ code: "PRECONDITION_FAILED", message: "BAN済みの通報ではありません" });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(users)
        .set({ banned: false, banReason: null, banExpires: null })
        .where(eq(users.id, report.reportedUserId));

      await recalculateRanksForBannedUser(tx, report.reportedUserId);
    });
  }),

  getWarnings: protectedProcedure.input(z.object({ userId: z.number() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;

    if (session.user.id !== input.userId && session.user.role !== "ADMIN") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    return db.query.userReports.findMany({
      columns: { createdAt: true },
      where: { reportedUserId: input.userId, status: "WARNED" },
      with: {
        notificationWarning: { columns: { comment: true } },
      },
      orderBy: (t) => [desc(t.createdAt)],
    });
  }),

  list: adminProcedure.query(async ({ ctx }) => {
    const { db } = ctx;

    return db.query.userReports.findMany({
      orderBy: (t) => [asc(sql`case when ${t.status} = 'PENDING' then 0 else 1 end`), desc(t.createdAt)],
      with: {
        reporter: { columns: { id: true, name: true } },
        reportedUser: { columns: { id: true, name: true, banned: true, warningCount: true, banReason: true } },
        resolver: { columns: { id: true, name: true } },
        notificationWarning: { columns: { comment: true } },
      },
    });
  }),
} satisfies TRPCRouterRecord;

const createReportResultNotification = async (
  tx: TXType,
  { recipientId, reportId }: { recipientId: number; reportId: number },
) => {
  const notificationId = generateNotificationId();

  await tx.insert(notifications).values({
    id: notificationId,
    recipientId,
    type: "REPORT_RESULT",
  });

  await tx.insert(notificationReportResults).values({
    notificationId,
    reportId,
  });
};

const createWarningNotification = async (
  tx: TXType,
  { recipientId, reportId, comment }: { recipientId: number; reportId: number; comment: string },
) => {
  const notificationId = generateNotificationId();

  await tx.insert(notifications).values({
    id: notificationId,
    recipientId,
    type: "WARNING",
  });

  await tx.insert(notificationWarnings).values({
    notificationId,
    reportId,
    comment,
  });
};

const recalculateRanksForBannedUser = async (tx: TXType, bannedUserId: number) => {
  const affectedMaps = await tx.select({ mapId: results.mapId }).from(results).where(eq(results.userId, bannedUserId));

  for (const { mapId } of affectedMaps) {
    const rankedUsers = await tx
      .select({ userId: results.userId })
      .from(results)
      .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
      .innerJoin(users, eq(users.id, results.userId))
      .where(and(eq(results.mapId, mapId), eq(users.banned, false)))
      .orderBy(desc(resultStatuses.score));

    for (const [index, entry] of rankedUsers.entries()) {
      await tx
        .update(results)
        .set({ rank: index + 1 })
        .where(and(eq(results.mapId, mapId), eq(results.userId, entry.userId)));
    }

    await tx.update(maps).set({ rankingCount: rankedUsers.length }).where(eq(maps.id, mapId));
  }
};
