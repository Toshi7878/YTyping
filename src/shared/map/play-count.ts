import { orpcClient } from "@/orpc/provider";

export const mutatePlayCountStats = ({ mapId }: { mapId: number }) => {
  void orpcClient.user.stats.incrementPlayCountStats({ mapId });
};
