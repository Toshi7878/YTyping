import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, desc, eq, inArray, max } from "drizzle-orm";
import z from "zod";
import { env } from "@/env";
import { downloadPublicFile, uploadPublicFile } from "@/server/api/lib/storage";
import type { TXType } from "@/server/drizzle/client";
import { db } from "@/server/drizzle/client";
import {
  mapDifficulties,
  maps,
  notificationOverTakes,
  notifications,
  resultStatuses,
  results,
  userStats,
} from "@/server/drizzle/schema";
import type { TypingLineResult } from "@/validator/result/result";
import { CreateResultSchema } from "@/validator/result/result";
import {
  buildRawPPInputFromResultStatus,
  calcRawPP,
  calcTotalPP,
  TOTAL_PP_TOP_N,
} from "../../../../domain/result/pp/calc";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { gzipCompress, gzipDecompress } from "../../utils/gzip";
import { generateNotificationId } from "../notification";
import { resultClapRouter } from "./clap";
import { resultListRouter } from "./list";
import { resultPpRouter } from "./pp";

export const resultRouter = {
  getJsonById: publicProcedure.input(z.object({ resultId: z.number().nullable() })).query(async ({ input }) => {
    const data = await downloadPublicFile(`result-json/${input.resultId}.json.gz`);

    if (!data) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Result data not found" });
    }

    const jsonString = new TextDecoder().decode(await gzipDecompress(data));
    const jsonData: TypingLineResult[] = JSON.parse(jsonString);

    return jsonData;
  }),

  upsert: protectedProcedure.input(CreateResultSchema).mutation(async ({ input, ctx }) => {
    if (env.NODE_ENV === "development") throw new TRPCError({ code: "FORBIDDEN" });

    const { session } = ctx;
    const { id: userId } = session.user;
    const { mapId, lineResults, status } = input;

    return db.transaction(async (tx) => {
      const ratingRow = await tx
        .select({ rating: mapDifficulties.rating })
        .from(mapDifficulties)
        .where(eq(mapDifficulties.mapId, mapId))
        .limit(1)
        .then((rows) => rows[0]);

      if (!ratingRow) {
        throw new TRPCError({ code: "NOT_FOUND", message: "譜面の難易度情報が見つかりません" });
      }

      const rawPPInput = buildRawPPInputFromResultStatus(status);
      const rating = ratingRow.rating;
      const pp = calcRawPP(rawPPInput, rating);
      const statusWithPp = { ...status, pp, starRatingSnapshot: rating };

      const existingResult = await tx
        .select({ id: results.id })
        .from(results)
        .where(and(eq(results.userId, userId), eq(results.mapId, mapId)))
        .limit(1)
        .then((rows) => rows[0]);

      let resultId: number | undefined;

      if (existingResult) {
        resultId = await tx
          .update(results)
          .set({ updatedAt: new Date() })
          .where(eq(results.id, existingResult.id))
          .returning({ id: results.id })
          .then((res) => res[0]?.id);
      } else {
        const nextId = await getNextResultId(tx);

        resultId = await tx
          .insert(results)
          .values({ id: nextId, mapId, userId })
          .returning({ id: results.id })
          .then((res) => res[0]?.id);
      }
      if (!resultId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED" });
      }

      await tx
        .insert(resultStatuses)
        .values({ resultId, ...statusWithPp })
        .onConflictDoUpdate({ target: [resultStatuses.resultId], set: statusWithPp });

      await recalculateUserTotalPP(tx, userId);

      const jsonString = JSON.stringify(lineResults, null, 2);
      const compressed = await gzipCompress(Buffer.from(jsonString, "utf8"));

      await uploadPublicFile({
        key: `result-json/${resultId}.json.gz`,
        body: compressed,
        contentType: "application/gzip",
      });

      const rankedUsers = await tx
        .select({
          userId: results.userId,
          rank: results.rank,
          score: resultStatuses.score,
        })
        .from(results)
        .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
        .where(eq(results.mapId, mapId))
        .orderBy(desc(resultStatuses.score));

      await cleanupOutdatedOvertakeNotifications({ tx, mapId, userId, rankedUsers });
      await updateRankingsAndNotifyOvertakes({ tx, mapId, userId, rankedUsers });

      await tx.update(maps).set({ rankingCount: rankedUsers.length }).where(eq(maps.id, mapId));

      const myRankIndex = rankedUsers.findIndex((user) => user.userId === userId);
      const myRank = myRankIndex !== -1 ? myRankIndex + 1 : null;

      return { rankingCount: rankedUsers.length, myRank, myRankUpdatedAt: new Date() };
    });
  }),

  list: resultListRouter,
  pp: resultPpRouter,
  clap: resultClapRouter,
} satisfies TRPCRouterRecord;

const getNextResultId = async (db: TXType) => {
  const maxId = await db
    .select({ maxId: max(results.id) })
    .from(results)
    .then((rows) => rows[0]?.maxId ?? 0);

  return maxId + 1;
};

const cleanupOutdatedOvertakeNotifications = async ({
  tx,
  mapId,
  userId,
  rankedUsers,
}: {
  tx: TXType;
  mapId: number;
  userId: number;
  rankedUsers: { userId: number; rank: number; score: number }[];
}) => {
  const myResult = rankedUsers.find((record) => record.userId === userId);
  if (!myResult) return;

  const overtakeNotifications = await tx
    .select({
      notificationId: notificationOverTakes.notificationId,
      visitorId: notificationOverTakes.visitorId,
      visitorScore: resultStatuses.score,
    })
    .from(notificationOverTakes)
    .innerJoin(notifications, eq(notifications.id, notificationOverTakes.notificationId))
    .innerJoin(
      results,
      and(eq(results.userId, notificationOverTakes.visitorId), eq(results.mapId, notificationOverTakes.mapId)),
    )
    .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
    .where(
      and(
        eq(notificationOverTakes.visitedId, userId),
        eq(notificationOverTakes.mapId, mapId),
        eq(notifications.type, "OVER_TAKE"),
      ),
    );

  // 自分の最新スコア以下の訪問者の通知IDを取得
  const notificationIdsToDelete = overtakeNotifications
    .filter((notification) => notification.visitorScore <= myResult.score)
    .map((notification) => notification.notificationId);

  if (notificationIdsToDelete.length > 0) {
    // Notificationsを削除すると、NotificationOverTakesもカスケード削除される
    await tx.delete(notifications).where(inArray(notifications.id, notificationIdsToDelete));
  }
};

const updateRankingsAndNotifyOvertakes = async ({
  tx,
  mapId,
  userId,
  rankedUsers,
}: {
  tx: TXType;
  mapId: number;
  userId: number;
  rankedUsers: { userId: number; rank: number; score: number }[];
}) => {
  for (const [index, rankedUser] of rankedUsers.entries()) {
    const nextRank = index + 1;
    const prevRank = rankedUser.rank;

    await tx
      .update(results)
      .set({ rank: nextRank })
      .where(and(eq(results.mapId, mapId), eq(results.userId, rankedUser.userId)));

    const isOtherUser = rankedUser.userId !== userId;
    if (isOtherUser && prevRank <= 5 && prevRank !== nextRank) {
      const { userId: recipientId } = rankedUser;

      const existingNotificationId = await tx
        .select({ notificationId: notificationOverTakes.notificationId })
        .from(notificationOverTakes)
        .where(
          and(
            eq(notificationOverTakes.visitorId, userId),
            eq(notificationOverTakes.visitedId, recipientId),
            eq(notificationOverTakes.mapId, mapId),
          ),
        )
        .limit(1)
        .then((res) => res[0]?.notificationId ?? null);

      if (existingNotificationId) {
        await tx
          .update(notifications)
          .set({ checked: false, updatedAt: new Date() })
          .where(eq(notifications.id, existingNotificationId));

        await tx
          .update(notificationOverTakes)
          .set({ prevRank })
          .where(eq(notificationOverTakes.notificationId, existingNotificationId));
      } else {
        const notificationId = generateNotificationId();

        await tx.insert(notifications).values({
          id: notificationId,
          recipientId,
          type: "OVER_TAKE",
        });

        await tx.insert(notificationOverTakes).values({
          notificationId,
          visitorId: userId,
          visitedId: recipientId,
          mapId,
          prevRank,
        });
      }
    }
  }
};

/** ユーザーの全スコア pp から total pp を再計算し `user_stats.total_pp` を更新する */
async function recalculateUserTotalPP(tx: TXType, userId: number) {
  const rows = await tx
    .select({ pp: resultStatuses.pp })
    .from(resultStatuses)
    .innerJoin(results, eq(results.id, resultStatuses.resultId))
    .where(eq(results.userId, userId))
    .orderBy(desc(resultStatuses.pp))
    .limit(TOTAL_PP_TOP_N);

  const totalPP = Math.round(calcTotalPP(rows));

  await tx
    .insert(userStats)
    .values({ userId, totalPp: totalPP })
    .onConflictDoUpdate({
      target: [userStats.userId],
      set: { totalPp: totalPP },
    });
}
