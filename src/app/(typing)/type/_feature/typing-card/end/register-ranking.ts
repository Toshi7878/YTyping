import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInfiniteQueryCache, updateQueryCache } from "@/lib/react-query";
import { orpc } from "@/orpc/provider";
import type { MapListItem } from "@/server/api/routers/map";

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
  const queryClient = useQueryClient();

  return useMutation(
    orpc.result.ranking.register.mutationOptions({
      onError,
      onSuccess: async (serverRes, input) => {
        onSuccess();

        const { myRank, myRankUpdatedAt, rankingCount } = serverRes;
        const mapId = input.mapId;

        // --- Server Updates ---
        const updater = createMapUpdater(mapId, {
          server: { count: rankingCount, myRank, myRankUpdatedAt },
        });

        const mapListFilter = { queryKey: orpc.map.list.key() };
        const resultListFilter = { queryKey: orpc.result.list.key() };
        const notificationsFilter = { queryKey: orpc.notification.getInfinite.key({ type: "infinite" }) };

        updateInfiniteQueryCache(queryClient, mapListFilter, updater.forMap);
        updateQueryCache(queryClient, mapListFilter, updater.forMap);
        updateInfiniteQueryCache(queryClient, resultListFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, notificationsFilter, updater.forItemWithMap);

        // Ranking自体のクエリだけは再取得（順位変動など他のユーザーの情報も含むため）
        await queryClient.invalidateQueries({ queryKey: orpc.result.ranking.get.queryKey({ input: { mapId } }) });
      },
    }),
  );
};
