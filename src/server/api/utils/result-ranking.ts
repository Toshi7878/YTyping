import { and, desc, eq, isNull } from "drizzle-orm";
import type { TXType } from "@/server/drizzle/client";
import { maps, resultStatuses, results, users } from "@/server/drizzle/schema";

/** 運営に無効とマークされていない記録 */
export const isValidResult = isNull(results.invalidatedAt);

/**
 * 譜面のランキングを計算し直す。
 * BAN されたユーザーと無効な記録は順位を持たない（無効な記録の rank は null）。
 */
export const recalculateRanksForMap = async (tx: TXType, mapId: number) => {
  const rankedUsers = await tx
    .select({ userId: results.userId })
    .from(results)
    .innerJoin(resultStatuses, eq(resultStatuses.resultId, results.id))
    .innerJoin(users, eq(users.id, results.userId))
    .where(and(eq(results.mapId, mapId), eq(users.banned, false), isValidResult))
    .orderBy(desc(resultStatuses.score));

  for (const [index, entry] of rankedUsers.entries()) {
    await tx
      .update(results)
      .set({ rank: index + 1 })
      .where(and(eq(results.mapId, mapId), eq(results.userId, entry.userId)));
  }

  await tx.update(maps).set({ rankingCount: rankedUsers.length }).where(eq(maps.id, mapId));

  return rankedUsers.length;
};
