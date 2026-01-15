import { getTRPCClient } from "@/trpc/provider";
import { getTimezone } from "@/utils/date";
import { readUserStats, resetUserStats } from "../atoms/ref";

export const mutateImeStats = async () => {
  const { imeTypeCount, typingTime } = readUserStats();

  const trpc = getTRPCClient();

  const timezone = getTimezone();

  void trpc.user.stats.incrementImeStats.mutate({ imeTypeCount, typingTime, timezone });

  resetUserStats();
};
