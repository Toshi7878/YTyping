import { TRPCError, type TRPCRouterRecord } from "@trpc/server";
import { and, desc, eq, inArray, lte, max } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { revalidateTag, unstable_cache } from "next/cache";
import z from "zod/v4";
import { env } from "@/env";
import { uploadPublicFile } from "@/server/api/lib/storage";
import type { TXType } from "@/server/drizzle/client";
import {
  maps,
  notificationOverTakes,
  notifications,
  resultStatuses,
  results,
  userStats,
  users,
} from "@/server/drizzle/schema";
import { CreateResultSchema } from "@/validator/result/result";
import { calcRawPP, calcTotalPP, resultToRawPPInput, TOTAL_PP_TOP_N } from "../../../../shared/result/pp/calc";
import { protectedProcedure, publicProcedure } from "../../trpc";
import { gzipCompress } from "../../utils/gzip";
import { generateNotificationId } from "../notification";
import { getRankingClapCounts } from "./clap";

export const rankingCacheTag = (mapId: number) => `ranking-${mapId}`;

export const resultRankingRouter = {
  get: publicProcedure.input(z.object({ mapId: z.number() })).query(async ({ input, ctx }) => {
    const { db, session } = ctx;
    const { mapId } = input;

    const player = alias(users, "player");
    const ranking = await unstable_cache(
      async () =>
        db
          .select({
            id: results.id,
            updatedAt: results.updatedAt,
            rank: results.rank,
            score: resultStatuses.score,
            player: { id: player.id, name: player.name },
            typeCounts: {
              romaType: resultStatuses.romaType,
              kanaType: resultStatuses.kanaType,
              flickType: resultStatuses.flickType,
              englishType: resultStatuses.englishType,
              symbolType: resultStatuses.symbolType,
              spaceType: resultStatuses.spaceType,
              numType: resultStatuses.numType,
            },
            otherStatus: {
              playSpeed: resultStatuses.minPlaySpeed,
              miss: resultStatuses.miss,
              lost: resultStatuses.lost,
              maxCombo: resultStatuses.maxCombo,
              clearRate: resultStatuses.clearRate,
              isCaseSensitive: resultStatuses.isCaseSensitive,
              pp: resultStatuses.pp,
            },
            typeSpeed: {
              kpm: resultStatuses.kpm,
              rkpm: resultStatuses.rkpm,
              kanaToRomaKpm: resultStatuses.kanaToRomaKpm,
              kanaToRomaRkpm: resultStatuses.kanaToRomaRkpm,
            },
          })
          .from(results)
          .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
          .innerJoin(player, eq(player.id, results.userId))
          .where(eq(results.mapId, mapId))
          .orderBy(desc(resultStatuses.score)),
      [rankingCacheTag(mapId)],
      { tags: [rankingCacheTag(mapId)] },
    )();

    const clapDetails = await getRankingClapCounts(db, session, input.mapId);
    const clapMap = new Map(clapDetails.map((c) => [c.resultId, c]));

    return ranking.map((item) => {
      const clap = clapMap.get(item.id);
      return {
        ...item,
        clap: { count: clap?.clapCount ?? 0, hasClapped: clap?.hasClapped ?? false },
      };
    });
  }),

  register: protectedProcedure.input(CreateResultSchema).mutation(async ({ input, ctx }) => {
    if (env.NODE_ENV === "development") throw new TRPCError({ code: "FORBIDDEN" });
    const { db, session } = ctx;
    const { id: userId } = session.user;
    const { mapId, lineResults, status } = input;

    const map = await db.query.mapDifficulties.findFirst({ columns: { rating: true }, where: { mapId } });
    if (!map) throw new TRPCError({ code: "NOT_FOUND" });

    const pp = calcRawPP(resultToRawPPInput(status), map.rating);
    const statusWithPp = { ...status, pp, starRatingSnapshot: map.rating };

    const existingResult = await db.query.results.findFirst({ where: { userId, mapId }, columns: { id: true } });
    const txResult = await db.transaction(async (tx) => {
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
      if (!resultId) throw new TRPCError({ code: "PRECONDITION_FAILED" });

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

      await removeStaleOvertakeNotifications({ tx, mapId, userId, rankedUsers });
      await applyNewRanks(tx, mapId, rankedUsers);
      await sendOvertakeNotifications(tx, { mapId, submitterId: userId, rankedUsers });

      await tx.update(maps).set({ rankingCount: rankedUsers.length }).where(eq(maps.id, mapId));

      const myRankIndex = rankedUsers.findIndex((user) => user.userId === userId);
      const myRank = myRankIndex !== -1 ? myRankIndex + 1 : null;

      return { rankingCount: rankedUsers.length, myRank, myRankUpdatedAt: new Date() };
    });

    revalidateTag(rankingCacheTag(mapId), "max");

    return txResult;
  }),
} satisfies TRPCRouterRecord;

const getNextResultId = async (db: TXType) => {
  const maxId = await db
    .select({ maxId: max(results.id) })
    .from(results)
    .then((rows) => rows[0]?.maxId ?? 0);

  return maxId + 1;
};

const removeStaleOvertakeNotifications = async ({
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

  const staleIds = await tx
    .select({ notificationId: notificationOverTakes.notificationId })
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
        lte(resultStatuses.score, myResult.score),
      ),
    )
    .then((rows) => rows.map(({ notificationId }) => notificationId));

  if (staleIds.length > 0) {
    await tx.delete(notifications).where(inArray(notifications.id, staleIds));
  }
};

const applyNewRanks = async (tx: TXType, mapId: number, rankedUsers: { userId: number }[]) => {
  for (const [index, entry] of rankedUsers.entries()) {
    await tx
      .update(results)
      .set({ rank: index + 1 })
      .where(and(eq(results.mapId, mapId), eq(results.userId, entry.userId)));
  }
};

const sendOvertakeNotifications = async (
  tx: TXType,
  {
    mapId,
    submitterId,
    rankedUsers,
  }: { mapId: number; submitterId: number; rankedUsers: { userId: number; rank: number }[] },
) => {
  for (const [index, entry] of rankedUsers.entries()) {
    const newRank = index + 1;
    const oldRank = entry.rank;
    const wasDisplacedInTop5 = entry.userId !== submitterId && oldRank <= 5 && oldRank !== newRank;
    if (!wasDisplacedInTop5) continue;

    await upsertOvertakeNotification(tx, {
      mapId,
      submitterId,
      overtakenUserId: entry.userId,
      oldRank,
    });
  }
};

const upsertOvertakeNotification = async (
  tx: TXType,
  {
    mapId,
    submitterId,
    overtakenUserId,
    oldRank,
  }: { mapId: number; submitterId: number; overtakenUserId: number; oldRank: number },
) => {
  const priorNotificationId = await tx
    .select({ notificationId: notificationOverTakes.notificationId })
    .from(notificationOverTakes)
    .where(
      and(
        eq(notificationOverTakes.visitorId, submitterId),
        eq(notificationOverTakes.visitedId, overtakenUserId),
        eq(notificationOverTakes.mapId, mapId),
      ),
    )
    .limit(1)
    .then((res) => res[0]?.notificationId ?? null);

  if (priorNotificationId) {
    await tx
      .update(notifications)
      .set({ checked: false, updatedAt: new Date() })
      .where(eq(notifications.id, priorNotificationId));

    await tx
      .update(notificationOverTakes)
      .set({ prevRank: oldRank })
      .where(eq(notificationOverTakes.notificationId, priorNotificationId));
  } else {
    const notificationId = generateNotificationId();

    await tx.insert(notifications).values({
      id: notificationId,
      recipientId: overtakenUserId,
      type: "OVER_TAKE",
    });

    await tx.insert(notificationOverTakes).values({
      notificationId,
      visitorId: submitterId,
      visitedId: overtakenUserId,
      mapId,
      prevRank: oldRank,
    });
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
    .onConflictDoUpdate({ target: [userStats.userId], set: { totalPp: totalPP } });
}
