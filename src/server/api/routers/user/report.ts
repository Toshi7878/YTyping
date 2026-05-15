import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import z from "zod";
import { REPORT_STATUS_TYPES, userReports, users } from "@/server/drizzle/schema";
import { userReportApiSchema } from "@/validator/user/report";
import { protectedProcedure } from "../../trpc";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.session.user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  return next({ ctx });
});

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

  resolve: adminProcedure
    .input(
      z.object({
        reportId: z.number(),
        adminNote: z.string().max(1000).optional(),
        banUser: z.boolean().default(false),
        banReason: z.string().max(500).optional(),
        banExpires: z.date().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;
      const { reportId, adminNote, banUser, banReason, banExpires } = input;

      const report = await db.query.userReports.findFirst({
        columns: { id: true, reportedUserId: true, status: true },
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

        if (banUser) {
          await tx
            .update(users)
            .set({ banned: true, banReason, banExpires: banExpires ?? null })
            .where(eq(users.id, report.reportedUserId));
        }
      });
    }),

  dismiss: adminProcedure
    .input(z.object({ reportId: z.number(), adminNote: z.string().max(1000).optional() }))
    .mutation(async ({ input, ctx }) => {
      const { db, session } = ctx;
      const { reportId, adminNote } = input;

      const report = await db.query.userReports.findFirst({
        columns: { id: true, status: true },
        where: { id: reportId },
      });

      if (!report) {
        throw new TRPCError({ code: "NOT_FOUND", message: "報告が見つかりません" });
      }

      if (report.status !== "PENDING") {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "この報告は既に処理済みです" });
      }

      await db
        .update(userReports)
        .set({
          status: "DISMISSED",
          adminNote,
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        })
        .where(eq(userReports.id, reportId));
    }),

  list: adminProcedure
    .input(
      z.object({
        status: z.enum(REPORT_STATUS_TYPES).optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { db } = ctx;

      return db.query.userReports.findMany({
        where: input.status ? { status: input.status } : undefined,
        orderBy: (t) => [desc(t.createdAt)],
        with: {
          reporter: { columns: { id: true, name: true } },
          reportedUser: { columns: { id: true, name: true } },
          resolver: { columns: { id: true, name: true } },
        },
      });
    }),
} satisfies TRPCRouterRecord;
