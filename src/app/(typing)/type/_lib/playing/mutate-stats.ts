import { trpcClient } from "@/trpc/provider";
import { readMapId, readUserStats, resetUserStats } from "../atoms/ref";

export const mutatePlayCountStats = () => {
  const mapId = readMapId();
  void trpcClient.userStats.incrementPlayCountStats.mutate({ mapId });
};

export const mutateTypingStats = () => {
  const userStats = readUserStats();
  void trpcClient.userStats.incrementTypingStats.mutate(userStats);
  resetUserStats();
};
