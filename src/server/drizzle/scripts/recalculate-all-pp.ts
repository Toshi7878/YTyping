/**
 * pp 計算式変更時に、全 `result_statuses.pp` を再計算し、続けて各ユーザーの `user_stats.total_pp` を再計算する。
 * 星難易度は常に保存済みの `star_rating_snapshot` のみを用いる（再計算時点の `map_difficulties.rating` には従わない）。
 *
 * @example pnpm pp:recalculate
 */
import { desc, eq } from "drizzle-orm";
import { buildRawPPInputFromResultStatus, calcRawPP, calcTotalPP, TOTAL_PP_TOP_N } from "@/domain/result/pp/calc";
import type { TXType } from "@/server/drizzle/client";
import { db } from "@/server/drizzle/client";
import { resultStatuses, results, userStats } from "../schema";

const BATCH = 150;

async function main() {
  const rows = await db
    .select({
      resultId: results.id,
      starRatingSnapshot: resultStatuses.starRatingSnapshot,
      romaType: resultStatuses.romaType,
      kanaType: resultStatuses.kanaType,
      flickType: resultStatuses.flickType,
      englishType: resultStatuses.englishType,
      spaceType: resultStatuses.spaceType,
      symbolType: resultStatuses.symbolType,
      numType: resultStatuses.numType,
      miss: resultStatuses.miss,
      clearRate: resultStatuses.clearRate,
      minPlaySpeed: resultStatuses.minPlaySpeed,
    })
    .from(results)
    .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id));

  if (rows.length === 0) {
    console.log("対象のスコアがありません。終了します。");
    process.exit(0);
  }

  console.log(`再計算対象: ${rows.length} 件`);

  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    await db.transaction(async (tx) => {
      for (const row of chunk) {
        const rawInput = buildRawPPInputFromResultStatus(row);
        const pp = calcRawPP(rawInput, row.starRatingSnapshot);
        await tx.update(resultStatuses).set({ pp }).where(eq(resultStatuses.resultId, row.resultId));
      }
    });
    console.log(`  result_statuses 更新: ${Math.min(i + BATCH, rows.length)} / ${rows.length}`);
  }

  const userRows = await db.select({ userId: results.userId }).from(results).groupBy(results.userId);

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
    .select({ pp: resultStatuses.pp })
    .from(resultStatuses)
    .innerJoin(results, eq(results.id, resultStatuses.resultId))
    .where(eq(results.userId, userId))
    .orderBy(desc(resultStatuses.pp))
    .limit(TOTAL_PP_TOP_N);

  const totalPp = Math.round(calcTotalPP(ppRows));

  await tx
    .insert(userStats)
    .values({ userId, totalPp })
    .onConflictDoUpdate({
      target: [userStats.userId],
      set: { totalPp },
    });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
