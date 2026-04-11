import { getSession } from "@/lib/auth-client";
import { getTRPCClient } from "@/trpc/provider";
import { getTimezone } from "@/utils/date";
import { readUserStats, resetUserStats } from "../atoms/ref";

export const mutateImeStats = async () => {
  const { data } = await getSession();
  if (!data?.user) return;

  const stats = readUserStats();
  if (Object.values(stats).every((v) => v === 0)) return;

  const { imeTypeCount, typingTime } = stats;

  const trpc = getTRPCClient();

  const timezone = getTimezone();

  void trpc.user.stats.incrementImeStats.mutate({ imeTypeCount, typingTime, timezone });

  resetUserStats();
};
