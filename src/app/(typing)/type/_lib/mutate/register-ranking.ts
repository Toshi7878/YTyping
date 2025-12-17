import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapListItem } from "@/server/api/routers/map";
import { useTRPC } from "@/trpc/provider";
import { updateInfiniteQuery as updateInfiniteQueryCache } from "../../../../../lib/update-query-cache";

function calculateRankingState(
  current: MapListItem["ranking"],
  optimisticUpdatedAt?: Date,
  serverState?: MapListItem["ranking"],
) {
  if (serverState) return serverState;

  if (optimisticUpdatedAt) {
    const isFirstRank = current.myRank === null;
    return {
      ...current,
      count: isFirstRank ? current.count + 1 : current.count,
      myRankUpdatedAt: optimisticUpdatedAt,
    };
  }
  return current;
}

const createMapUpdater = (mapId: number, newState: { optimistic?: Date; server?: MapListItem["ranking"] }) => {
  const updateMap = (map: MapListItem): MapListItem => {
    if (map.id !== mapId) return map;
    return {
      ...map,
      ranking: calculateRankingState(map.ranking, newState.optimistic, newState.server),
    };
  };

  return {
    forMap: updateMap,
    forItemWithMap: <T>(item: T): T => {
      const i = item as T & { map: MapListItem };
      if (i.map?.id !== mapId) return item;
      return { ...i, map: updateMap(i.map) };
    },
  };
};

export const useRegisterRankingMutation = ({ onSuccess, onError }: { onSuccess: () => void; onError: () => void }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.result.createResult.mutationOptions({
      onError,
      onSuccess: async (serverRes, input) => {
        onSuccess();

        const { myRank, myRankUpdatedAt, rankingCount } = serverRes;
        const mapId = input.mapId;

        // --- Server Updates ---
        const updater = createMapUpdater(mapId, {
          server: { count: rankingCount, myRank, myRankUpdatedAt },
        });

        const mapListFilter = trpc.mapList.pathFilter();
        const timelineFilter = trpc.resultList.getWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.resultList.getWithMapByUserId.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();

        updateInfiniteQueryCache(queryClient, mapListFilter, updater.forMap);
        updateInfiniteQueryCache(queryClient, timelineFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, userResultsFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, notificationsFilter, updater.forItemWithMap);

        // Ranking自体のクエリだけは再取得（順位変動など他のユーザーの情報も含むため）
        await queryClient.invalidateQueries(trpc.resultList.getMapRanking.queryFilter({ mapId }));
      },
    }),
  );
};
