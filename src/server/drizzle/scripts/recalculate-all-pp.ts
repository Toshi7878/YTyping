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
import { ResultStatuses, Results, UserStats } from "@/server/drizzle/schema";

const BATCH = 150;

async function main() {
  const rows = await db
    .select({
      resultId: Results.id,
      starRatingSnapshot: ResultStatuses.starRatingSnapshot,
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
    .innerJoin(ResultStatuses, eq(ResultStatuses.resultId, Results.id));

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
        await tx.update(ResultStatuses).set({ pp }).where(eq(ResultStatuses.resultId, row.resultId));
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
    .where(eq(Results.userId, userId))
    .orderBy(desc(ResultStatuses.pp))
    .limit(TOTAL_PP_TOP_N);

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
