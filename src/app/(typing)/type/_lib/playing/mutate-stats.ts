import { getTRPCClient } from "@/trpc/provider";
import { readUserStats, resetUserStats } from "../atoms/ref";
import { readMapId } from "../atoms/state";

export const mutatePlayCountStats = () => {
  const mapId = readMapId();
  const trpcClient = getTRPCClient();

  void trpcClient.userStats.incrementPlayCountStats.mutate({ mapId });
};

export const mutateTypingStats = () => {
  const userStats = readUserStats();
  const trpcClient = getTRPCClient();

  void trpcClient.userStats.incrementTypingStats.mutate(userStats);
  resetUserStats();
};
