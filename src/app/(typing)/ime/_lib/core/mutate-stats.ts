import { getSession } from "@/lib/auth-client";
import { getTRPCClient } from "@/trpc/provider";
import { getTimezone } from "@/utils/date";
import { type ImeStats, resetImeStats } from "../atoms/ref";

export const mutateImeStats = (stats: ImeStats) => {
  const session = getSession();
  if (!session) return;
  if (Object.values(stats).every((v) => v === 0)) return;

  const trpc = getTRPCClient();
  const timezone = getTimezone();
  void trpc.user.stats.incrementImeStats.mutate({ ...stats, timezone });
  resetImeStats();
};
