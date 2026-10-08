import { getSession } from "@/auth/client";
import { orpcClient } from "@/orpc/provider";
import { getTimezone } from "@/utils/date";
import { resetTypingStats, type TypingStats } from "../atoms/stats";

export const mutateTypingStats = (stats: TypingStats) => {
  const session = getSession();
  if (!session) return;
  if (Object.values(stats).every((v) => v === 0)) return;
  const timezone = getTimezone();

  void orpcClient.user.stats.incrementTypingStats({ ...stats, timezone });
  resetTypingStats();
};

export const mutateIncrementMapCompletionPlayCountStats = ({ mapId }: { mapId: number }) => {
  void orpcClient.user.stats.incrementMapCompletionPlayCount({ mapId });
};
