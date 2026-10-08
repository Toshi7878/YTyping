import { getSession } from "@/auth/client";
import { orpcClient } from "@/orpc/provider";
import { getTimezone } from "@/utils/date";
import { type ImeStats, resetImeStats } from "../atoms/ref";

export const mutateImeStats = (stats: ImeStats) => {
  const session = getSession();
  if (!session) return;
  if (Object.values(stats).every((v) => v === 0)) return;
  const timezone = getTimezone();
  void orpcClient.user.stats.incrementImeStats({ ...stats, timezone });
  resetImeStats();
};
