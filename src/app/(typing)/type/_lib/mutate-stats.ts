import { getTRPCClient } from "@/trpc/provider";
import { readMapId } from "./atoms/hydrate";
import { readUserStats, resetUserStats } from "./atoms/ref";

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

export const mutateIncrementMapCompletionPlayCountStats = () => {
  const trpcClient = getTRPCClient();
  const mapId = readMapId();
  void trpcClient.userStats.incrementMapCompletionPlayCount.mutate({ mapId });
};
