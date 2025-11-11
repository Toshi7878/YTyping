import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapListItem } from "@/server/api/routers/map-list";
import type { RouterOutPuts } from "@/server/api/trpc";
import type { Trpc } from "@/trpc/provider";
import { useTRPC } from "@/trpc/provider";

type MapListFilter = ReturnType<Trpc["mapList"]["get"]["infiniteQueryFilter"]>;
type TimeLineFilter = ReturnType<Trpc["result"]["getAllWithMap"]["infiniteQueryFilter"]>;
type ActiveUserMapsFilter = ReturnType<Trpc["mapList"]["getByActiveUser"]["queryFilter"]>;
type NotificationsMapFilter = ReturnType<Trpc["notification"]["getInfinite"]["infiniteQueryFilter"]>;
type MapListByCreatorFilter = ReturnType<Trpc["mapList"]["getByCreatorId"]["infiniteQueryFilter"]>;
type MapListLikedByUserFilter = ReturnType<Trpc["mapList"]["getByLikedUserId"]["infiniteQueryFilter"]>;
type MapListByVideoIdFilter = ReturnType<Trpc["mapList"]["getByVideoId"]["queryFilter"]>;
type UserResultsFilter = ReturnType<Trpc["result"]["getAllWithMapByUserId"]["infiniteQueryFilter"]>;
type ResultsInfiniteFilter = TimeLineFilter | UserResultsFilter;
type MapListInfiniteFilter = MapListFilter | MapListByCreatorFilter | MapListLikedByUserFilter;

function setMapListInfiniteOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListInfiniteFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<{ items: MapListItem[] }>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((map) =>
          map.id === mapId
            ? ({
                ...map,
                like: {
                  count: optimisticState ? map.like.count + 1 : Math.max(0, map.like.count - 1),
                  hasLiked: optimisticState,
                },
              } satisfies MapListItem)
            : map,
        ),
      })),
    };
  });
}

function setMapListInfiniteServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListInfiniteFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<{ items: MapListItem[] }>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((map) => (map.id === mapId ? { ...map, like: { count: likeCount, hasLiked } } : map)),
      })),
    };
  });
}

function setResultsWithMapOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ResultsInfiniteFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<{ items: RouterOutPuts["result"]["getAllWithMap"]["items"][number][] }>>(
    filter,
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((result) =>
            result.map?.id === mapId
              ? {
                  ...result,
                  map: {
                    ...result.map,
                    like: {
                      count: optimisticState ? result.map.like.count + 1 : Math.max(0, result.map.like.count - 1),
                      hasLiked: optimisticState,
                    },
                  } satisfies MapListItem,
                }
              : result,
          ),
        })),
      };
    },
  );
}

function setResultsWithMapServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ResultsInfiniteFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<{ items: RouterOutPuts["result"]["getAllWithMap"]["items"][number][] }>>(
    filter,
    (old) => {
      if (!old?.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          items: page.items.map((result) =>
            result.map?.id === mapId
              ? {
                  ...result,
                  map: { ...result.map, like: { count: likeCount, hasLiked } } satisfies MapListItem,
                }
              : result,
          ),
        })),
      };
    },
  );
}

function setMapListByVideoOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListByVideoIdFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["mapList"]["getByVideoId"]>(filter, (old) => {
    if (!old) return old;
    return old.map((map) =>
      map.id === mapId
        ? ({
            ...map,
            like: {
              hasLiked: optimisticState,
              count: optimisticState ? map.like.count + 1 : Math.max(0, map.like.count - 1),
            },
          } satisfies MapListItem)
        : map,
    );
  });
}

function setMapListByVideoServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListByVideoIdFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["mapList"]["getByVideoId"]>(filter, (old) => {
    if (!old) return old;
    return old.map((map) => (map.id === mapId ? { ...map, like: { count: likeCount, hasLiked } } : map));
  });
}

function setNotificationsOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: NotificationsMapFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["notification"]["getInfinite"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((notification) =>
          notification.map.id === mapId
            ? {
                ...notification,
                map: {
                  ...notification.map,
                  like: {
                    hasLiked: optimisticState,
                    count: optimisticState
                      ? notification.map.like.count + 1
                      : Math.max(0, notification.map.like.count - 1),
                  },
                } satisfies MapListItem,
              }
            : notification,
        ),
      })),
    };
  });
}

function setNotificationsServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: NotificationsMapFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["notification"]["getInfinite"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((notification) =>
          notification.map.id === mapId
            ? {
                ...notification,
                map: { ...notification.map, like: { hasLiked, count: likeCount } } satisfies MapListItem,
              }
            : notification,
        ),
      })),
    };
  });
}

function setActiveUsersOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ActiveUserMapsFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["mapList"]["getByActiveUser"]>(filter, (old) => {
    if (!old) return old;
    return old.map((user) =>
      user.map?.id === mapId
        ? {
            ...user,
            map: {
              ...user.map,
              like: {
                hasLiked: optimisticState,
                count: optimisticState ? user.map.like.count + 1 : Math.max(0, user.map.like.count - 1),
              },
            } satisfies MapListItem,
          }
        : user,
    );
  });
}

function setActiveUsersServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ActiveUserMapsFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["mapList"]["getByActiveUser"]>(filter, (old) => {
    if (!old) return old;
    return old.map((user) =>
      user.map?.id === mapId ? { ...user, map: { ...user.map, like: { count: likeCount, hasLiked } } } : user,
    );
  });
}

function setMapInfoOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ReturnType<Trpc["map"]["getMapInfo"]["queryFilter"]>,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["map"]["getMapInfo"]>(filter, (old) => {
    if (!old) return old;
    return {
      ...old,
      hasLiked: optimisticState,
    };
  });
}

function setMapInfoServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ReturnType<Trpc["map"]["getMapInfo"]["queryFilter"]>,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["map"]["getMapInfo"]>(filter, (old) => {
    if (!old) return old;
    return { ...old, hasLiked };
  });
}

export function useLikeMutationMapList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.like.toggleLike.mutationOptions({
      onMutate: async (input) => {
        const mapListFilter = trpc.mapList.get.infiniteQueryFilter();
        const mapListByCreatorFilter = trpc.mapList.getByCreatorId.infiniteQueryFilter();
        const mapListLikedByUserFilter = trpc.mapList.getByLikedUserId.infiniteQueryFilter();
        const mapListByVideoFilter = trpc.mapList.getByVideoId.queryFilter();
        const timelineFilter = trpc.result.getAllWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.result.getAllWithMapByUserId.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
        const activeUserMapsFilter = trpc.mapList.getByActiveUser.queryFilter();

        await queryClient.cancelQueries(mapListFilter);
        await queryClient.cancelQueries(mapListByCreatorFilter);
        await queryClient.cancelQueries(mapListLikedByUserFilter);
        await queryClient.cancelQueries(mapListByVideoFilter);
        await queryClient.cancelQueries(timelineFilter);
        await queryClient.cancelQueries(userResultsFilter);
        await queryClient.cancelQueries(notificationsFilter);
        await queryClient.cancelQueries(activeUserMapsFilter);

        const previous = [
          ...queryClient.getQueriesData(mapListFilter),
          ...queryClient.getQueriesData(mapListByCreatorFilter),
          ...queryClient.getQueriesData(mapListLikedByUserFilter),
          ...queryClient.getQueriesData(mapListByVideoFilter),
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(userResultsFilter),
          ...queryClient.getQueriesData(notificationsFilter),
          ...queryClient.getQueriesData(activeUserMapsFilter),
        ];

        setMapListInfiniteOptimistic(queryClient, mapListFilter, input.mapId, input.newState);
        setMapListInfiniteOptimistic(queryClient, mapListByCreatorFilter, input.mapId, input.newState);
        setMapListInfiniteOptimistic(queryClient, mapListLikedByUserFilter, input.mapId, input.newState);
        setMapListByVideoOptimistic(queryClient, mapListByVideoFilter, input.mapId, input.newState);
        setResultsWithMapOptimistic(queryClient, timelineFilter, input.mapId, input.newState);
        setResultsWithMapOptimistic(queryClient, userResultsFilter, input.mapId, input.newState);
        setNotificationsOptimistic(queryClient, notificationsFilter, input.mapId, input.newState);
        setActiveUsersOptimistic(queryClient, activeUserMapsFilter, input.mapId, input.newState);

        return {
          previous,
          notificationsFilter,
          activeUserMapsFilter,
          mapListFilter,
          mapListByCreatorFilter,
          mapListLikedByUserFilter,
          mapListByVideoFilter,
          timelineFilter,
          userResultsFilter,
        };
      },
      onError: (_e, _v, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
        }
      },
      onSuccess: (server, _, ctx) => {
        if (!ctx) return;
        setMapListInfiniteServer(queryClient, ctx.mapListFilter, server.mapId, server.likeCount, server.hasLiked);
        setMapListInfiniteServer(
          queryClient,
          ctx.mapListByCreatorFilter,
          server.mapId,
          server.likeCount,
          server.hasLiked,
        );
        setMapListInfiniteServer(
          queryClient,
          ctx.mapListLikedByUserFilter,
          server.mapId,
          server.likeCount,
          server.hasLiked,
        );
        setMapListByVideoServer(queryClient, ctx.mapListByVideoFilter, server.mapId, server.likeCount, server.hasLiked);
        setResultsWithMapServer(queryClient, ctx.timelineFilter, server.mapId, server.likeCount, server.hasLiked);
        setResultsWithMapServer(queryClient, ctx.userResultsFilter, server.mapId, server.likeCount, server.hasLiked);
        setNotificationsServer(queryClient, ctx.notificationsFilter, server.mapId, server.likeCount, server.hasLiked);
        setActiveUsersServer(queryClient, ctx.activeUserMapsFilter, server.mapId, server.likeCount, server.hasLiked);
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
        const timelineFilter = trpc.result.getAllWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.result.getAllWithMapByUserId.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
        const activeUserMapsFilter = trpc.mapList.getByActiveUser.queryFilter();

        await queryClient.cancelQueries(mapInfoFilter);
        await queryClient.cancelQueries(mapListFilter);
        await queryClient.cancelQueries(mapListByCreatorFilter);
        await queryClient.cancelQueries(mapListLikedByUserFilter);
        await queryClient.cancelQueries(mapListByVideoFilter);
        await queryClient.cancelQueries(timelineFilter);
        await queryClient.cancelQueries(userResultsFilter);
        await queryClient.cancelQueries(notificationsFilter);
        await queryClient.cancelQueries(activeUserMapsFilter);

        const previous = [
          ...queryClient.getQueriesData(mapInfoFilter),
          ...queryClient.getQueriesData(mapListFilter),
          ...queryClient.getQueriesData(mapListByCreatorFilter),
          ...queryClient.getQueriesData(mapListLikedByUserFilter),
          ...queryClient.getQueriesData(mapListByVideoFilter),
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(userResultsFilter),
          ...queryClient.getQueriesData(notificationsFilter),
          ...queryClient.getQueriesData(activeUserMapsFilter),
        ];

        setMapInfoOptimistic(queryClient, mapInfoFilter, input.newState);
        setMapListInfiniteOptimistic(queryClient, mapListFilter, input.mapId, input.newState);
        setMapListInfiniteOptimistic(queryClient, mapListByCreatorFilter, input.mapId, input.newState);
        setMapListInfiniteOptimistic(queryClient, mapListLikedByUserFilter, input.mapId, input.newState);
        setMapListByVideoOptimistic(queryClient, mapListByVideoFilter, input.mapId, input.newState);
        setResultsWithMapOptimistic(queryClient, timelineFilter, input.mapId, input.newState);
        setResultsWithMapOptimistic(queryClient, userResultsFilter, input.mapId, input.newState);
        setNotificationsOptimistic(queryClient, notificationsFilter, input.mapId, input.newState);
        setActiveUsersOptimistic(queryClient, activeUserMapsFilter, input.mapId, input.newState);

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
          activeUserMapsFilter,
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
        setMapInfoServer(queryClient, ctx.mapInfoFilter, hasLiked);
        setMapListInfiniteServer(queryClient, ctx.mapListFilter, mapId, likeCount, hasLiked);
        setMapListInfiniteServer(queryClient, ctx.mapListByCreatorFilter, mapId, likeCount, hasLiked);
        setMapListInfiniteServer(queryClient, ctx.mapListLikedByUserFilter, mapId, likeCount, hasLiked);
        setMapListByVideoServer(queryClient, ctx.mapListByVideoFilter, mapId, likeCount, hasLiked);
        setResultsWithMapServer(queryClient, ctx.timelineFilter, mapId, likeCount, hasLiked);
        setResultsWithMapServer(queryClient, ctx.userResultsFilter, mapId, likeCount, hasLiked);
        setNotificationsServer(queryClient, ctx.notificationsFilter, mapId, likeCount, hasLiked);
        setActiveUsersServer(queryClient, ctx.activeUserMapsFilter, mapId, likeCount, hasLiked);
      },
    }),
  );
}
