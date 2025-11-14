import { getTRPCClient } from "@/trpc/provider";
import { readUserStats, resetUserStats } from "../atoms/ref";

export const mutateImeStats = async () => {
  const { imeTypeCount, typingTime } = readUserStats();

  const trpc = getTRPCClient();
  void trpc.userStats.incrementImeStats.mutate({ imeTypeCount, typingTime });

  resetUserStats();
};
