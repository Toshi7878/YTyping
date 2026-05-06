import { getTRPCClient } from "@/trpc/provider";

export const mutatePlayCountStats = ({ mapId }: { mapId: number }) => {
  const trpcClient = getTRPCClient();
  void trpcClient.user.stats.incrementPlayCountStats.mutate({ mapId });
};
