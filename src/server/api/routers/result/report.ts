import { ORPCError } from "@orpc/server";
import { and, asc, desc, eq, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import z from "zod";
import { maps, notificationMessages, notifications, resultReports, results, users } from "@/server/drizzle/schema";
import { resultReportApiSchema } from "@/validator/result/report";
import { notifyAdmins } from "../../lib/discord";
import { adminProcedure, protectedProcedure } from "../../orpc";
import { generateNotificationId } from "../notification";
import { invalidateResult } from "./invalidation";

export const resultReportRouter = {
  submit: protectedProcedure.input(resultReportApiSchema).handler(async ({ input, context }) => {
    const { db, session } = context;
    const { resultId, reasonDetail } = input;

    const result = await db.query.results.findFirst({
      columns: { id: true, userId: true, mapId: true },
      where: { id: resultId },
    });
    if (!result) throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });
    if (result.userId === session.user.id) {
      throw new ORPCError("BAD_REQUEST", { message: "自分の記録を報告することはできません" });
    }

    const existing = await db.query.resultReports.findFirst({
      columns: { id: true },
      where: { reporterId: session.user.id, resultId, status: "PENDING" },
    });
    if (existing) throw new ORPCError("CONFLICT", { message: "この記録への報告は既に受け付けています" });

    await db.insert(resultReports).values({ reporterId: session.user.id, resultId, reasonDetail });

    notifyAdmins({
      title: "記録が報告されました",
      description: reasonDetail,
      adminPath: "/admin/result-reports",
      fields: [
        { name: "譜面ID", value: String(result.mapId) },
        { name: "記録ID", value: String(resultId) },
        { name: "通報者", value: session.user.name ?? `ID: ${session.user.id}` },
      ],
    });
  }),

  list: adminProcedure.handler(async ({ context }) => {
    const { db } = context;
    const reporter = alias(users, "reporter");
    const resultUser = alias(users, "result_user");

    return db
      .select({
        id: resultReports.id,
        status: resultReports.status,
        reasonDetail: resultReports.reasonDetail,
        adminNote: resultReports.adminNote,
        createdAt: resultReports.createdAt,
        resultId: resultReports.resultId,
        mapId: results.mapId,
        mapTitle: maps.title,
        isInvalidated: sql<boolean>`${results.invalidatedAt} is not null`,
        reporterId: resultReports.reporterId,
        reporterName: reporter.name,
        resultUserId: results.userId,
        resultUserName: resultUser.name,
      })
      .from(resultReports)
      .innerJoin(results, eq(results.id, resultReports.resultId))
      .innerJoin(maps, eq(maps.id, results.mapId))
      .innerJoin(reporter, eq(reporter.id, resultReports.reporterId))
      .innerJoin(resultUser, eq(resultUser.id, results.userId))
      .orderBy(
        asc(sql`case when ${resultReports.status} = 'PENDING' then 0 else 1 end`),
        desc(resultReports.createdAt),
      );
  }),

  /** 記録を無効化(BAN)し、同じ記録への未処理の報告をまとめて解決済みにする */
  invalidate: adminProcedure
    .input(z.object({ reportId: z.number(), adminNote: z.string().max(1000).optional() }))
    .handler(async ({ input, context }) => {
      const { db, session } = context;

      const report = await db.query.resultReports.findFirst({
        columns: { id: true, resultId: true, status: true },
        where: { id: input.reportId },
        with: { result: { columns: { mapId: true }, with: { map: { columns: { title: true } } } } },
      });
      if (!report) throw new ORPCError("NOT_FOUND", { message: "報告が見つかりません" });
      if (report.status !== "PENDING") {
        throw new ORPCError("PRECONDITION_FAILED", { message: "この報告は既に処理済みです" });
      }

      const { mapId, map } = report.result;
      const body = [
        `報告いただいた「${map.title}」の記録を確認し、無効にしました。ご協力ありがとうございます。`,
        input.adminNote ? `\n管理者コメント:\n${input.adminNote}` : "",
      ].join("\n");

      await db.transaction(async (tx) => {
        await invalidateResult(tx, { resultId: report.resultId, invalidatedBy: session.user.id });
        const resolved = await tx
          .update(resultReports)
          .set({ status: "RESOLVED", adminNote: input.adminNote, resolvedBy: session.user.id, resolvedAt: new Date() })
          .where(and(eq(resultReports.resultId, report.resultId), eq(resultReports.status, "PENDING")))
          .returning({ id: resultReports.id, reporterId: resultReports.reporterId });

        // 報告したユーザー全員に結果を通知する
        for (const { reporterId } of resolved) {
          const notificationId = generateNotificationId();
          await tx.insert(notifications).values({ id: notificationId, recipientId: reporterId, type: "MESSAGE" });
          await tx
            .insert(notificationMessages)
            .values({ notificationId, title: "記録の報告結果", body, href: `/type/${mapId}` });
        }
      });
    }),

  dismiss: adminProcedure
    .input(z.object({ reportId: z.number(), adminNote: z.string().max(1000).optional() }))
    .handler(async ({ input, context }) => {
      const { db, session } = context;

      const report = await db.query.resultReports.findFirst({
        columns: { id: true, status: true },
        where: { id: input.reportId },
      });
      if (!report) throw new ORPCError("NOT_FOUND", { message: "報告が見つかりません" });
      if (report.status !== "PENDING") {
        throw new ORPCError("PRECONDITION_FAILED", { message: "この報告は既に処理済みです" });
      }

      await db
        .update(resultReports)
        .set({ status: "DISMISSED", adminNote: input.adminNote, resolvedBy: session.user.id, resolvedAt: new Date() })
        .where(eq(resultReports.id, report.id));
    }),
};
