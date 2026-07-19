/**
 * pp 計算式変更時に、全 `result_statuses.pp` を再計算し、続けて各ユーザーの `user_stats.total_pp` を再計算する。
 * 星難易度は常に保存済みの `star_rating_snapshot` のみを用いる（再計算時点の `map_difficulties.rating` には従わない）。
 *
 * @example pnpm pp:recalculate
 */
import { eq } from "drizzle-orm";
import { recalculateUserPP } from "@/server/api/utils/recalculate-user-pp";
import { db } from "@/server/drizzle/client";
import { calcRawPP, resultToRawPPInput } from "@/shared/result/pp/calc";
import { resultStatuses, results } from "../schema";

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
        const rawInput = resultToRawPPInput(row);
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
        await recalculateUserPP(tx, userId);
      }
    });
    console.log(`  user_stats.total_pp 更新: ${Math.min(i + BATCH, userRows.length)} / ${userRows.length}`);
  }

  console.log("完了");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
