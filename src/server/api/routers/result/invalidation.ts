import { ORPCError } from "@orpc/server";
import { and, eq, inArray } from "drizzle-orm";
import z from "zod";
import type { TXType } from "@/server/drizzle/client";
import { notificationOverTakes, notifications, results } from "@/server/drizzle/schema";
import { adminProcedure } from "../../orpc";
import { recalculateUserPP } from "../../utils/recalculate-user-pp";
import { recalculateRanksForMap } from "../../utils/result-ranking";

const resultIdSchema = z.object({ resultId: z.number() });

export const resultInvalidationRouter = {
  /** 記録を無効としてマークする。順位を外し、譜面のランキングとユーザーのPPを計算し直す */
  invalidate: adminProcedure.input(resultIdSchema).handler(async ({ input, context }) => {
    const { db, session } = context;

    const result = await db.query.results.findFirst({
      columns: { id: true, mapId: true, userId: true, invalidatedAt: true },
      where: { id: input.resultId },
    });
    if (!result) throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });
    if (result.invalidatedAt) throw new ORPCError("PRECONDITION_FAILED", { message: "既に無効な記録です" });

    await db.transaction(async (tx) => {
      await tx
        .update(results)
        .set({ invalidatedAt: new Date(), invalidatedBy: session.user.id, rank: null })
        .where(eq(results.id, result.id));

      await recalculateRanksForMap(tx, result.mapId);
      await recalculateUserPP(tx, result.userId);
      await deleteOvertakeNotificationsByVisitor(tx, { visitorId: result.userId, mapId: result.mapId });
    });
  }),

  /** 無効のマークを解除する（異議申し立て対応用）。順位とPPを計算し直す */
  restore: adminProcedure.input(resultIdSchema).handler(async ({ input, context }) => {
    const { db } = context;

    const result = await db.query.results.findFirst({
      columns: { id: true, mapId: true, userId: true, invalidatedAt: true },
      where: { id: input.resultId },
    });
    if (!result) throw new ORPCError("NOT_FOUND", { message: "記録が見つかりません" });
    if (!result.invalidatedAt) throw new ORPCError("PRECONDITION_FAILED", { message: "無効な記録ではありません" });

    await db.transaction(async (tx) => {
      await tx.update(results).set({ invalidatedAt: null, invalidatedBy: null }).where(eq(results.id, result.id));

      await recalculateRanksForMap(tx, result.mapId);
      await recalculateUserPP(tx, result.userId);
    });
  }),
};

/** 無効にした記録が原因で届いていた「抜かれた」通知を削除する（その譜面分のみ） */
const deleteOvertakeNotificationsByVisitor = async (
  tx: TXType,
  { visitorId, mapId }: { visitorId: number; mapId: number },
) => {
  const staleIds = await tx
    .select({ notificationId: notificationOverTakes.notificationId })
    .from(notificationOverTakes)
    .where(and(eq(notificationOverTakes.visitorId, visitorId), eq(notificationOverTakes.mapId, mapId)))
    .then((rows) => rows.map(({ notificationId }) => notificationId));

  if (staleIds.length === 0) return;

  await tx.delete(notifications).where(inArray(notifications.id, staleIds));
};
