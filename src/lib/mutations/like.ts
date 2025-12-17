import type { QueryClient, QueryFilters } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapListItem } from "@/server/api/routers/map";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import {
  updateInfiniteQuery as updateInfiniteQueryCache,
  updateListQuery as updateListQueryCache,
} from "../update-query-cache";

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

// MapInfo (単体オブジェクト) のキャッシュを更新する汎用関数
function updateMapInfoQuery(
  queryClient: QueryClient,
  filter: QueryFilters,
  optimisticState?: boolean,
  serverState?: boolean,
) {
  queryClient.setQueriesData<RouterOutputs["map"]["getMapInfo"]>(filter, (old) => {
    if (!old) return old;
    const newState = serverState !== undefined ? serverState : optimisticState;
    if (newState === undefined) return old;
    return { ...old, hasLiked: newState };
  });
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

export function useLikeMutationMapList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.like.toggleLike.mutationOptions({
      onMutate: async (input) => {
        const mapListFilter = trpc.mapList.pathFilter();
        const timelineFilter = trpc.resultList.getWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.resultList.getWithMapByUserId.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();

        await Promise.all([
          queryClient.cancelQueries(mapListFilter),
          queryClient.cancelQueries(timelineFilter),
          queryClient.cancelQueries(userResultsFilter),
          queryClient.cancelQueries(notificationsFilter),
        ]);

        const previous = [
          ...queryClient.getQueriesData(mapListFilter),
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(userResultsFilter),
          ...queryClient.getQueriesData(notificationsFilter),
        ];

        // --- Optimistic Updates ---
        const updater = createMapUpdater(input.mapId, { optimistic: input.newState });

        updateInfiniteQueryCache(queryClient, mapListFilter, updater.forMap);
        updateInfiniteQueryCache(queryClient, timelineFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, userResultsFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, notificationsFilter, updater.forItemWithMap);

        return {
          previous,
          mapListFilter,
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

        updateInfiniteQueryCache(queryClient, ctx.mapListFilter, updater.forMap);
        updateInfiniteQueryCache(queryClient, ctx.timelineFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, ctx.userResultsFilter, updater.forItemWithMap);
        updateInfiniteQueryCache(queryClient, ctx.notificationsFilter, updater.forItemWithMap);
      },
    }),
  );
}

export function useLikeMutationMapInfo() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.like.toggleLike.mutationOptions({
      onMutate: async (input) => {
        const mapInfoFilter = trpc.map.getMapInfo.queryFilter();
        const mapListFilter = trpc.mapList.get.infiniteQueryFilter();
        const mapListByCreatorFilter = trpc.mapList.getByCreatorId.infiniteQueryFilter();
        const mapListLikedByUserFilter = trpc.mapList.getByLikedUserId.infiniteQueryFilter();
        const mapListByVideoFilter = trpc.mapList.getByVideoId.queryFilter();
        const timelineFilter = trpc.resultList.getWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.resultList.getWithMapByUserId.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
        const mapListByMapIdFilter = trpc.mapList.getByMapId.queryFilter();

        await Promise.all([
          queryClient.cancelQueries(mapInfoFilter),
          queryClient.cancelQueries(mapListFilter),
          queryClient.cancelQueries(mapListByCreatorFilter),
          queryClient.cancelQueries(mapListLikedByUserFilter),
          queryClient.cancelQueries(mapListByVideoFilter),
          queryClient.cancelQueries(timelineFilter),
          queryClient.cancelQueries(userResultsFilter),
          queryClient.cancelQueries(notificationsFilter),
          queryClient.cancelQueries(mapListByMapIdFilter),
        ]);

        const previous = [
          ...queryClient.getQueriesData(mapInfoFilter),
          ...queryClient.getQueriesData(mapListFilter),
          ...queryClient.getQueriesData(mapListByCreatorFilter),
          ...queryClient.getQueriesData(mapListLikedByUserFilter),
          ...queryClient.getQueriesData(mapListByVideoFilter),
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(userResultsFilter),
          ...queryClient.getQueriesData(notificationsFilter),
          ...queryClient.getQueriesData(mapListByMapIdFilter),
        ];

        updateMapInfoQuery(queryClient, mapInfoFilter, input.newState);
        updateInfiniteQueryCache(
          queryClient,
          mapListFilter,
          createMapUpdater(input.mapId, { optimistic: input.newState }).forMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          mapListByCreatorFilter,
          createMapUpdater(input.mapId, { optimistic: input.newState }).forMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          mapListLikedByUserFilter,
          createMapUpdater(input.mapId, { optimistic: input.newState }).forMap,
        );
        updateListQueryCache(
          queryClient,
          mapListByVideoFilter,
          createMapUpdater(input.mapId, { optimistic: input.newState }).forMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          timelineFilter,
          createMapUpdater(input.mapId, { optimistic: input.newState }).forItemWithMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          userResultsFilter,
          createMapUpdater(input.mapId, { optimistic: input.newState }).forItemWithMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          notificationsFilter,
          createMapUpdater(input.mapId, { optimistic: input.newState }).forItemWithMap,
        );
        updateListQueryCache(
          queryClient,
          mapListByMapIdFilter,
          createMapUpdater(input.mapId, { optimistic: input.newState }).forItemWithMap,
        );

        return {
          previous,
          mapInfoFilter,
          mapListFilter,
          mapListByCreatorFilter,
          mapListLikedByUserFilter,
          mapListByVideoFilter,
          timelineFilter,
          userResultsFilter,
          notificationsFilter,
          mapListByMapIdFilter,
        };
      },
      onError: (_e, _v, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
        }
      },
      onSuccess: (server, _vars, ctx) => {
        const { hasLiked, likeCount, mapId } = server;
        if (!ctx) return;
        updateMapInfoQuery(queryClient, ctx.mapInfoFilter, hasLiked);
        updateInfiniteQueryCache(
          queryClient,
          ctx.mapListFilter,
          createMapUpdater(mapId, { server: { count: likeCount, hasLiked } }).forMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          ctx.mapListByCreatorFilter,
          createMapUpdater(mapId, { server: { count: likeCount, hasLiked } }).forMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          ctx.mapListLikedByUserFilter,
          createMapUpdater(mapId, { server: { count: likeCount, hasLiked } }).forMap,
        );
        updateListQueryCache(
          queryClient,
          ctx.mapListByVideoFilter,
          createMapUpdater(mapId, { server: { count: likeCount, hasLiked } }).forMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          ctx.timelineFilter,
          createMapUpdater(mapId, { server: { count: likeCount, hasLiked } }).forItemWithMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          ctx.userResultsFilter,
          createMapUpdater(mapId, { server: { count: likeCount, hasLiked } }).forItemWithMap,
        );
        updateInfiniteQueryCache(
          queryClient,
          ctx.notificationsFilter,
          createMapUpdater(mapId, { server: { count: likeCount, hasLiked } }).forItemWithMap,
        );
        updateListQueryCache(
          queryClient,
          ctx.mapListByMapIdFilter,
          createMapUpdater(mapId, { server: { count: likeCount, hasLiked } }).forItemWithMap,
        );
      },
    }),
  );
}
