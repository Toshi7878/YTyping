import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, desc, eq, inArray, max } from "drizzle-orm";
import z from "zod";
import { downloadPublicFile, uploadPublicFile } from "@/server/api/utils/storage";
import type { TXType } from "@/server/drizzle/client";
import { db } from "@/server/drizzle/client";
import {
  MapDifficulties,
  Maps,
  NotificationOverTakes,
  Notifications,
  ResultStatuses,
  Results,
  UserStats,
} from "@/server/drizzle/schema";
import type { TypingLineResult } from "@/validator/result/result";
import { CreateResultSchema } from "@/validator/result/result";
import { buildRawPPInputFromResultStatus, calcRawPP, calcTotalPP, TOTAL_PP_TOP_N } from "../../../../lib/pp";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { gzipCompress, gzipDecompress } from "../../utils/gzip";
import { generateNotificationId } from "../../utils/id";
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
    const { session } = ctx;
    const { id: userId } = session.user;
    const { mapId, lineResults, status } = input;

    return db.transaction(async (tx) => {
      const ratingRow = await tx
        .select({ rating: MapDifficulties.rating })
        .from(MapDifficulties)
        .where(eq(MapDifficulties.mapId, mapId))
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
        .select({ id: Results.id })
        .from(Results)
        .where(and(eq(Results.userId, userId), eq(Results.mapId, mapId)))
        .limit(1)
        .then((rows) => rows[0]);

      let resultId: number | undefined;

      if (existingResult) {
        resultId = await tx
          .update(Results)
          .set({ updatedAt: new Date() })
          .where(eq(Results.id, existingResult.id))
          .returning({ id: Results.id })
          .then((res) => res[0]?.id);
      } else {
        const nextId = await getNextResultId(tx);

        resultId = await tx
          .insert(Results)
          .values({ id: nextId, mapId, userId })
          .returning({ id: Results.id })
          .then((res) => res[0]?.id);
      }
      if (!resultId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED" });
      }

      await tx
        .insert(ResultStatuses)
        .values({ resultId, ...statusWithPp })
        .onConflictDoUpdate({ target: [ResultStatuses.resultId], set: statusWithPp });

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
          userId: Results.userId,
          rank: Results.rank,
          score: ResultStatuses.score,
        })
        .from(Results)
        .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
        .where(eq(Results.mapId, mapId))
        .orderBy(desc(ResultStatuses.score));

      await cleanupOutdatedOvertakeNotifications({ tx, mapId, userId, rankedUsers });
      await updateRankingsAndNotifyOvertakes({ tx, mapId, userId, rankedUsers });

      await tx.update(Maps).set({ rankingCount: rankedUsers.length }).where(eq(Maps.id, mapId));

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
    .select({ maxId: max(Results.id) })
    .from(Results)
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
      notificationId: NotificationOverTakes.notificationId,
      visitorId: NotificationOverTakes.visitorId,
      visitorScore: ResultStatuses.score,
    })
    .from(NotificationOverTakes)
    .innerJoin(Notifications, eq(Notifications.id, NotificationOverTakes.notificationId))
    .innerJoin(
      Results,
      and(eq(Results.userId, NotificationOverTakes.visitorId), eq(Results.mapId, NotificationOverTakes.mapId)),
    )
    .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
    .where(
      and(
        eq(NotificationOverTakes.visitedId, userId),
        eq(NotificationOverTakes.mapId, mapId),
        eq(Notifications.type, "OVER_TAKE"),
      ),
    );

  // 自分の最新スコア以下の訪問者の通知IDを取得
  const notificationIdsToDelete = overtakeNotifications
    .filter((notification) => notification.visitorScore <= myResult.score)
    .map((notification) => notification.notificationId);

  if (notificationIdsToDelete.length > 0) {
    // Notificationsを削除すると、NotificationOverTakesもカスケード削除される
    await tx.delete(Notifications).where(inArray(Notifications.id, notificationIdsToDelete));
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
      .update(Results)
      .set({ rank: nextRank })
      .where(and(eq(Results.mapId, mapId), eq(Results.userId, rankedUser.userId)));

    const isOtherUser = rankedUser.userId !== userId;
    if (isOtherUser && prevRank <= 5 && prevRank !== nextRank) {
      const { userId: recipientId } = rankedUser;

      const existingNotificationId = await tx
        .select({ notificationId: NotificationOverTakes.notificationId })
        .from(NotificationOverTakes)
        .where(
          and(
            eq(NotificationOverTakes.visitorId, userId),
            eq(NotificationOverTakes.visitedId, recipientId),
            eq(NotificationOverTakes.mapId, mapId),
          ),
        )
        .limit(1)
        .then((res) => res[0]?.notificationId ?? null);

      if (existingNotificationId) {
        await tx
          .update(Notifications)
          .set({ checked: false, updatedAt: new Date() })
          .where(eq(Notifications.id, existingNotificationId));

        await tx
          .update(NotificationOverTakes)
          .set({ prevRank })
          .where(eq(NotificationOverTakes.notificationId, existingNotificationId));
      } else {
        const notificationId = generateNotificationId();

        await tx.insert(Notifications).values({
          id: notificationId,
          recipientId,
          type: "OVER_TAKE",
        });

        await tx.insert(NotificationOverTakes).values({
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
    .select({ pp: ResultStatuses.pp })
    .from(ResultStatuses)
    .innerJoin(Results, eq(Results.id, ResultStatuses.resultId))
    .where(eq(Results.userId, userId))
    .orderBy(desc(ResultStatuses.pp))
    .limit(TOTAL_PP_TOP_N);

  const totalPP = Math.round(calcTotalPP(rows));

  await tx
    .insert(UserStats)
    .values({ userId, totalPP })
    .onConflictDoUpdate({
      target: [UserStats.userId],
      set: { totalPP },
    });
}
