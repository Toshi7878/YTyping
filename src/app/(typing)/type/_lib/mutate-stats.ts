import { getTRPCClient } from "@/trpc/provider";
import { readMapId } from "./atoms/hydrate";
import { readUserStats, resetUserStats } from "./atoms/ref";

export const mutatePlayCountStats = () => {
  const mapId = readMapId();
  if (!mapId) return;
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
  const mapId = readMapId();
  if (!mapId) return;

  const trpcClient = getTRPCClient();
  void trpcClient.userStats.incrementMapCompletionPlayCount.mutate({ mapId });
};
