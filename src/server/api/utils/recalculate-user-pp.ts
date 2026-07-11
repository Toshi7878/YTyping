import { eq } from "drizzle-orm";
import type { TXType } from "@/server/drizzle/client";
import { resultStatuses, results, userStats } from "@/server/drizzle/schema";
import { calcTotalPP } from "@/shared/result/pp/calc";
import { classifyResultPpMode, type INPUT_PP_MODES } from "@/shared/result/pp/mode";

export async function recalculateUserPP(tx: TXType, userId: number) {
  const rows = await tx
    .select({
      pp: resultStatuses.pp,
      romaType: resultStatuses.romaType,
      kanaType: resultStatuses.kanaType,
      flickType: resultStatuses.flickType,
      englishType: resultStatuses.englishType,
      spaceType: resultStatuses.spaceType,
      symbolType: resultStatuses.symbolType,
      numType: resultStatuses.numType,
    })
    .from(resultStatuses)
    .innerJoin(results, eq(results.id, resultStatuses.resultId))
    .where(eq(results.userId, userId));

  const buckets: Record<(typeof INPUT_PP_MODES)[number], { pp: number }[]> = {
    roma: [],
    kana: [],
    flick: [],
    english: [],
  };

  for (const row of rows) {
    const mode = classifyResultPpMode(row);
    if (mode) buckets[mode].push({ pp: row.pp });
  }

  const values = {
    totalPp: Math.round(calcTotalPP(rows)),
    romaPp: Math.round(calcTotalPP(buckets.roma)),
    kanaPp: Math.round(calcTotalPP(buckets.kana)),
    flickPp: Math.round(calcTotalPP(buckets.flick)),
    englishPp: Math.round(calcTotalPP(buckets.english)),
  };

  await tx
    .insert(userStats)
    .values({ userId, ...values })
    .onConflictDoUpdate({ target: [userStats.userId], set: values });
}
