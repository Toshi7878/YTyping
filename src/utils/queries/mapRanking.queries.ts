import { useTRPC } from "@/trpc/trpc";

export const useMapRankingQueries = () => {
  const trpc = useTRPC();

  return {
    mapRanking: ({ mapId }: { mapId: string | number }) =>
      trpc.ranking.getMapRanking.queryOptions({
        mapId: Number(mapId),
      }),
  };
};
