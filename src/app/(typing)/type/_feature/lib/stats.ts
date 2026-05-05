import { getSession } from "@/auth/client";
import { getTRPCClient } from "@/trpc/provider";
import { getTimezone } from "@/utils/date";
import { resetTypingStats, type TypingStats } from "../atoms/stats";

export const mutateTypingStats = (stats: TypingStats) => {
  const session = getSession();
  if (!session) return;
  if (Object.values(stats).every((v) => v === 0)) return;

  const trpcClient = getTRPCClient();
  const timezone = getTimezone();

  void trpcClient.user.stats.incrementTypingStats.mutate({ ...stats, timezone });
  resetTypingStats();
};

export const mutateIncrementMapCompletionPlayCountStats = ({ mapId }: { mapId: number }) => {
  const trpcClient = getTRPCClient();
  void trpcClient.user.stats.incrementMapCompletionPlayCount.mutate({ mapId });
};
