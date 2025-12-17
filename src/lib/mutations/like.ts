import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapListItem } from "@/server/api/routers/map";
import { useTRPC } from "@/trpc/provider";
import { updateInfiniteQueryCache, updateQueryCache } from "../update-query-cache";

function calculateLikeState(
  current: { count: number; hasLiked: boolean },
  optimisticState?: boolean,
  serverState?: { count: number; hasLiked: boolean },
) {
  if (serverState) return serverState;
  if (optimisticState !== undefined) {
    return {
      count: optimisticState ? current.count + 1 : Math.max(0, current.count - 1),
      hasLiked: optimisticState,
    };
  }
  return current;
}

// 更新ロジックを生成するファクトリ
const createMapUpdater = (
  mapId: number,
  newState: { optimistic?: boolean; server?: { count: number; hasLiked: boolean } },
) => {
  // MapListItem 自体を更新する関数
  const updateMap = (map: MapListItem): MapListItem => {
    if (map.id !== mapId) return map;
    return {
      ...map,
      like: calculateLikeState(map.like, newState.optimistic, newState.server),
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

export function useToggleMapLikeMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.like.toggleLike.mutationOptions({
      onMutate: async (input) => {
        const mapListFilter = trpc.mapList.pathFilter();
        const mapInfoFilter = trpc.map.getMapInfo.queryFilter();
        const timelineFilter = trpc.resultList.getWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.resultList.getWithMapByUserId.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();

        await Promise.all([
          queryClient.cancelQueries(mapListFilter),
          queryClient.cancelQueries(mapInfoFilter),
          queryClient.cancelQueries(timelineFilter),
          queryClient.cancelQueries(userResultsFilter),
          queryClient.cancelQueries(notificationsFilter),
        ]);

        const previous = [
          ...queryClient.getQueriesData(mapListFilter),
          ...queryClient.getQueriesData(mapInfoFilter),
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(userResultsFilter),
          ...queryClient.getQueriesData(notificationsFilter),
        ];

        // --- Optimistic Updates ---
        const updater = createMapUpdater(input.mapId, { optimistic: input.newState });

        updateInfiniteQueryCache(queryClient, mapListFilter, updater.forMap);
        updateQueryCache(queryClient, mapListFilter, updater.forMap);
        updateQueryCache(queryClient, mapInfoFilter, updater.forMap);
        updateInfiniteQueryCache(queryClient, timelineFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, userResultsFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, notificationsFilter, updater.forItemWithMap);

        return {
          previous,
          mapListFilter,
          mapInfoFilter,
          timelineFilter,
          userResultsFilter,
          notificationsFilter,
        };
      },
      onError: (_e, _v, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
        }
      },
      onSuccess: (server, _, ctx) => {
        if (!ctx) return;
        const { hasLiked, likeCount, mapId } = server;

        // --- Server Updates ---
        const updater = createMapUpdater(mapId, { server: { count: likeCount, hasLiked } });

        updateInfiniteQueryCache(queryClient, ctx.mapListFilter, updater.forItemWithMap);
        updateQueryCache(queryClient, ctx.mapListFilter, updater.forMap);
        updateQueryCache(queryClient, ctx.mapInfoFilter, updater.forMap);
        updateInfiniteQueryCache(queryClient, ctx.timelineFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, ctx.userResultsFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, ctx.notificationsFilter, updater.forItemWithMap);
      },
    }),
  );
}
