/**
 * pp 計算式変更時に、全 `result_statuses.pp` を再計算し、続けて各ユーザーの `user_stats.total_pp` を再計算する。
 * 星難易度に使うのは常に `star_rating_snapshot`（再計算時点の `map_difficulties.rating` には従わない）。
 * ただし `result.updated_at < map.updated_at`（譜面の最終更新より前の最終登録）の行は
 * 譜面変更後の未再登録扱いとし、pp / star_rating_snapshot を 0 に揃える。
 * snapshot が 0（移行前データ）の非 stale 行は、同じバッチ内で `map` の難易度を snapshot として焼き付けてから pp を出す。
 *
 * @example pnpm pp:recalculate
 */
import { eq } from "drizzle-orm";
import { buildRawPPInputFromResultStatus, calcRawPP, calcTotalPP } from "@/server/api/routers/result/pp";
import type { TXType } from "@/server/drizzle/client";
import { db } from "@/server/drizzle/client";
import { MapDifficulties, Maps, ResultStatuses, Results, UserStats } from "@/server/drizzle/schema";

const BATCH = 150;

async function main() {
  const rows = await db
    .select({
      resultId: Results.id,
      userId: Results.userId,
      resultUpdatedAt: Results.updatedAt,
      mapUpdatedAt: Maps.updatedAt,
      starRatingSnapshot: ResultStatuses.starRatingSnapshot,
      mapRating: MapDifficulties.rating,
      romaType: ResultStatuses.romaType,
      kanaType: ResultStatuses.kanaType,
      flickType: ResultStatuses.flickType,
      englishType: ResultStatuses.englishType,
      spaceType: ResultStatuses.spaceType,
      symbolType: ResultStatuses.symbolType,
      numType: ResultStatuses.numType,
      miss: ResultStatuses.miss,
      clearRate: ResultStatuses.clearRate,
      minPlaySpeed: ResultStatuses.minPlaySpeed,
    })
    .from(Results)
    .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id))
    .innerJoin(Maps, eq(Maps.id, Results.mapId))
    .leftJoin(MapDifficulties, eq(MapDifficulties.mapId, Results.mapId));

  if (rows.length === 0) {
    console.log("対象のスコアがありません。終了します。");
    process.exit(0);
  }

  console.log(`再計算対象: ${rows.length} 件`);

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    await db.transaction(async (tx) => {
      for (const row of chunk) {
        const isStale = row.resultUpdatedAt.getTime() < row.mapUpdatedAt.getTime();

        if (isStale) {
          await tx
            .update(ResultStatuses)
            .set({ pp: 0, starRatingSnapshot: 0 })
            .where(eq(ResultStatuses.resultId, row.resultId));
          continue;
        }

        const statusInput = {
          romaType: row.romaType,
          kanaType: row.kanaType,
          flickType: row.flickType,
          englishType: row.englishType,
          spaceType: row.spaceType,
          symbolType: row.symbolType,
          numType: row.numType,
          miss: row.miss,
          clearRate: row.clearRate,
          minPlaySpeed: row.minPlaySpeed,
        };
        const rawInput = buildRawPPInputFromResultStatus(statusInput);
        const mapR = row.mapRating ?? 0;
        const snapshot = row.starRatingSnapshot > 0 ? row.starRatingSnapshot : mapR;
        const pp = calcRawPP(rawInput, snapshot);
        if (row.starRatingSnapshot > 0) {
          await tx.update(ResultStatuses).set({ pp }).where(eq(ResultStatuses.resultId, row.resultId));
        } else {
          await tx
            .update(ResultStatuses)
            .set({ pp, starRatingSnapshot: mapR })
            .where(eq(ResultStatuses.resultId, row.resultId));
        }
      }
    });
    console.log(`  result_statuses 更新: ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }

  const userRows = await db.select({ userId: Results.userId }).from(Results).groupBy(Results.userId);

  console.log(`ユーザー total_pp 再計算: ${userRows.length} 人`);

  for (let i = 0; i < userRows.length; i += BATCH) {
    const chunk = userRows.slice(i, i + BATCH);
    await db.transaction(async (tx) => {
      for (const { userId } of chunk) {
        await syncUserTotalPP(tx, userId);
      }
    });
    console.log(`  user_stats.total_pp 更新: ${Math.min(i + BATCH, userRows.length)} / ${userRows.length}`);
  }

  console.log("完了");
}

async function syncUserTotalPP(tx: TXType, userId: number) {
  const ppRows = await tx
    .select({ pp: ResultStatuses.pp })
    .from(ResultStatuses)
    .innerJoin(Results, eq(Results.id, ResultStatuses.resultId))
    .where(eq(Results.userId, userId));

  const totalPP = Math.round(calcTotalPP(ppRows));

  await tx
    .insert(UserStats)
    .values({ userId, totalPP })
    .onConflictDoUpdate({
      target: [UserStats.userId],
      set: { totalPP },
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
