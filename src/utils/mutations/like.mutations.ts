import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapListItem } from "@/server/api/routers/map-list";
import type { RouterOutPuts } from "@/server/api/trpc";
import type { Trpc } from "@/trpc/provider";
import { useTRPC } from "@/trpc/provider";

type MapListFilter = ReturnType<Trpc["mapList"]["getList"]["infiniteQueryFilter"]>;
type TimeLineFilter = ReturnType<Trpc["result"]["getAllWithMap"]["infiniteQueryFilter"]>;
type ActiveUserMapsFilter = ReturnType<Trpc["mapList"]["getActiveUserPlayingMaps"]["queryFilter"]>;
type NotificationsMapFilter = ReturnType<Trpc["notification"]["getInfinite"]["infiniteQueryFilter"]>;
type MapListByCreatorFilter = ReturnType<Trpc["mapList"]["getListByCreatorId"]["infiniteQueryFilter"]>;
type MapListLikedByUserFilter = ReturnType<Trpc["mapList"]["getLikeListByUserId"]["infiniteQueryFilter"]>;
type MapListByVideoIdFilter = ReturnType<Trpc["mapList"]["getByVideoId"]["queryFilter"]>;
type UserResultsFilter = ReturnType<Trpc["result"]["getAllWithMapByUserId"]["infiniteQueryFilter"]>;
type ResultsInfiniteFilter = TimeLineFilter | UserResultsFilter;

function setMapListOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<{ items: MapListItem[] }>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        maps: page.items.map((map) =>
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

function setMapListServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["mapList"]["getList"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((map) =>
          map.id === mapId ? ({ ...map, like: { count: likeCount, hasLiked } } satisfies MapListItem) : map,
        ),
      })),
    };
  });
}

function setResultsOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ResultsInfiniteFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<{ items: (RouterOutPuts["result"]["getAllWithMap"]["items"][number])[] }>>(
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
                      count: optimisticState
                        ? result.map.like.count + 1
                        : Math.max(0, result.map.like.count - 1),
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

function setResultsServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ResultsInfiniteFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<{ items: (RouterOutPuts["result"]["getAllWithMap"]["items"][number])[] }>>(
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

function setMapListByCreatorOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListByCreatorFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["mapList"]["getListByCreatorId"]>>(filter, (old) => {
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

function setMapListByCreatorServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListByCreatorFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["mapList"]["getListByCreatorId"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((map) =>
          map.id === mapId ? ({ ...map, like: { count: likeCount, hasLiked } } satisfies MapListItem) : map,
        ),
      })),
    };
  });
}

function setMapListLikedByUserOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListLikedByUserFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["mapList"]["getLikeListByUserId"]>>(filter, (old) => {
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

function setMapListLikedByUserServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListLikedByUserFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["mapList"]["getLikeListByUserId"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((map) =>
          map.id === mapId ? ({ ...map, like: { count: likeCount, hasLiked } } satisfies MapListItem) : map,
        ),
      })),
    };
  });
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

function setUserResultsOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: UserResultsFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["getAllWithMapByUserId"]>>(filter, (old) => {
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
                  hasLiked: optimisticState,
                  count: optimisticState ? result.map.like.count + 1 : Math.max(0, result.map.like.count - 1),
                },
              } satisfies MapListItem,
            }
            : result,
        ),
      })),
    };
  });
}

function setUserResultsServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: UserResultsFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["getAllWithMapByUserId"]>>(filter, (old) => {
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
        notifications: page.notifications.map((n) =>
          n.map.id === mapId
            ? {
                ...n,
                map: {
                  ...n.map,
                  like: {
                    hasLiked: optimisticState,
                    count: optimisticState ? n.map.like.count + 1 : Math.max(0, n.map.like.count - 1),
                  },
                } satisfies MapListItem,
              }
            : n,
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
        notifications: page.notifications.map((map) =>
          map.map.id === mapId
            ? { ...map, map: { ...map.map, like: { hasLiked, count: likeCount } } satisfies MapListItem }
            : map,
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
  queryClient.setQueriesData<RouterOutPuts["mapList"]["getActiveUserPlayingMaps"]>(filter, (old) => {
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
  queryClient.setQueriesData<RouterOutPuts["mapList"]["getActiveUserPlayingMaps"]>(filter, (old) => {
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
        const mapListFilter = trpc.mapList.getList.infiniteQueryFilter();
        const mapListByCreatorFilter = trpc.mapList.getListByCreatorId.infiniteQueryFilter();
        const mapListLikedByUserFilter = trpc.mapList.getLikeListByUserId.infiniteQueryFilter();
        const mapListByVideoFilter = trpc.mapList.getByVideoId.queryFilter();
        const timelineFilter = trpc.result.getAllWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.result.getAllWithMapByUserId.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
        const activeUserMapsFilter = trpc.mapList.getActiveUserPlayingMaps.queryFilter();

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

        setMapListOptimistic(queryClient, mapListFilter, input.mapId, input.newState);
        setMapListByCreatorOptimistic(queryClient, mapListByCreatorFilter, input.mapId, input.newState);
        setMapListLikedByUserOptimistic(queryClient, mapListLikedByUserFilter, input.mapId, input.newState);
        setMapListByVideoOptimistic(queryClient, mapListByVideoFilter, input.mapId, input.newState);
        setResultsOptimistic(queryClient, timelineFilter, input.mapId, input.newState);
        setResultsOptimistic(queryClient, userResultsFilter, input.mapId, input.newState);
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
        setMapListServer(queryClient, ctx.mapListFilter, server.mapId, server.likeCount, server.hasLiked);
        setMapListByCreatorServer(
          queryClient,
          ctx.mapListByCreatorFilter,
          server.mapId,
          server.likeCount,
          server.hasLiked,
        );
        setMapListLikedByUserServer(
          queryClient,
          ctx.mapListLikedByUserFilter,
          server.mapId,
          server.likeCount,
          server.hasLiked,
        );
        setMapListByVideoServer(queryClient, ctx.mapListByVideoFilter, server.mapId, server.likeCount, server.hasLiked);
        setResultsServer(queryClient, ctx.timelineFilter, server.mapId, server.likeCount, server.hasLiked);
        setResultsServer(queryClient, ctx.userResultsFilter, server.mapId, server.likeCount, server.hasLiked);
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
        const mapListFilter = trpc.mapList.getList.infiniteQueryFilter();
        const mapListByCreatorFilter = trpc.mapList.getListByCreatorId.infiniteQueryFilter();
        const mapListLikedByUserFilter = trpc.mapList.getLikeListByUserId.infiniteQueryFilter();
        const mapListByVideoFilter = trpc.mapList.getByVideoId.queryFilter();
        const timelineFilter = trpc.result.getAllWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.result.getAllWithMapByUserId.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
        const activeUserMapsFilter = trpc.mapList.getActiveUserPlayingMaps.queryFilter();

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
        setMapListOptimistic(queryClient, mapListFilter, input.mapId, input.newState);
        setMapListByCreatorOptimistic(queryClient, mapListByCreatorFilter, input.mapId, input.newState);
        setMapListLikedByUserOptimistic(queryClient, mapListLikedByUserFilter, input.mapId, input.newState);
        setMapListByVideoOptimistic(queryClient, mapListByVideoFilter, input.mapId, input.newState);
        setResultsOptimistic(queryClient, timelineFilter, input.mapId, input.newState);
        setResultsOptimistic(queryClient, userResultsFilter, input.mapId, input.newState);
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
        setMapListServer(queryClient, ctx.mapListFilter, mapId, likeCount, hasLiked);
        setMapListByCreatorServer(queryClient, ctx.mapListByCreatorFilter, mapId, likeCount, hasLiked);
        setMapListLikedByUserServer(queryClient, ctx.mapListLikedByUserFilter, mapId, likeCount, hasLiked);
        setMapListByVideoServer(queryClient, ctx.mapListByVideoFilter, mapId, likeCount, hasLiked);
        setResultsServer(queryClient, ctx.timelineFilter, mapId, likeCount, hasLiked);
        setResultsServer(queryClient, ctx.userResultsFilter, mapId, likeCount, hasLiked);
        setNotificationsServer(queryClient, ctx.notificationsFilter, mapId, likeCount, hasLiked);
        setActiveUsersServer(queryClient, ctx.activeUserMapsFilter, mapId, likeCount, hasLiked);
      },
    }),
  );
}
