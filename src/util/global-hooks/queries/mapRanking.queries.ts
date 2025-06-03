import { clientApi } from "@/trpc/client-api";

export const useMapRankingQueries = {
  getMapRanking: ({ mapId }: { mapId: string | number }) =>
    clientApi.ranking.getMapRanking.useQuery({
      mapId: Number(mapId),
    }),
};
