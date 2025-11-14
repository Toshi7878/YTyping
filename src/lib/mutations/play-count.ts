import { getTRPCClient } from "@/trpc/provider";

export const mutatePlayCountStats = ({ mapId }: { mapId: number }) => {
  const trpcClient = getTRPCClient();
  void trpcClient.userStats.incrementPlayCountStats.mutate({ mapId });
};
