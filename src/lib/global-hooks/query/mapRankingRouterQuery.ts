import { clientApi } from "@/trpc/client-api";

export const useMapRankingQuery = ({ mapId }: { mapId: string }) => {
  return clientApi.ranking.getMapRanking.useQuery({
    mapId: Number(mapId),
  });
};
