import { useTRPC } from "@/trpc/provider";

export const useMapRankingQueries = () => {
  const trpc = useTRPC();

  return {
    mapRanking: ({ mapId }: { mapId: string | number }) =>
      trpc.ranking.getMapRanking.queryOptions(
        {
          mapId: Number(mapId),
        },
        {
          gcTime: Infinity,
        },
      ),
  };
};
