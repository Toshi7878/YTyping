import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MapListItem } from "@/server/api/routers/map-list";
import type { RouterOutPuts } from "@/server/api/trpc";
import type { Trpc } from "@/trpc/provider";
import { useTRPC } from "@/trpc/provider";

type MapListFilter = ReturnType<Trpc["mapList"]["getList"]["infiniteQueryFilter"]>;
type TimeLineFilter = ReturnType<Trpc["result"]["usersResultList"]["infiniteQueryFilter"]>;
type ActiveUserMapsFilter = ReturnType<Trpc["mapList"]["getActiveUserPlayingMaps"]["queryFilter"]>;
type NotificationsMapFilter = ReturnType<Trpc["notification"]["getInfinite"]["infiniteQueryFilter"]>;

function setMapListOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["mapList"]["getList"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        maps: page.maps.map((map) =>
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
        maps: page.maps.map((map) =>
          map.id === mapId ? ({ ...map, like: { count: likeCount, hasLiked } } satisfies MapListItem) : map,
        ),
      })),
    };
  });
}

function setTimelineOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: TimeLineFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["usersResultList"]>>(filter, (old) => {
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
  });
}

function setTimelineServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: TimeLineFilter,
  mapId: number,
  likeCount: number,
  hasLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["usersResultList"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((result) =>
          result.map.id === mapId
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
        const timelineFilter = trpc.result.usersResultList.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
        const activeUserMapsFilter = trpc.mapList.getActiveUserPlayingMaps.queryFilter();

        await queryClient.cancelQueries(mapListFilter);
        await queryClient.cancelQueries(timelineFilter);
        await queryClient.cancelQueries(notificationsFilter);
        await queryClient.cancelQueries(activeUserMapsFilter);

        const previous = [
          ...queryClient.getQueriesData(mapListFilter),
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(notificationsFilter),
          ...queryClient.getQueriesData(activeUserMapsFilter),
        ];

        setMapListOptimistic(queryClient, mapListFilter, input.mapId, input.newState);
        setTimelineOptimistic(queryClient, timelineFilter, input.mapId, input.newState);
        setNotificationsOptimistic(queryClient, notificationsFilter, input.mapId, input.newState);
        setActiveUsersOptimistic(queryClient, activeUserMapsFilter, input.mapId, input.newState);

        return { previous, notificationsFilter, activeUserMapsFilter, mapListFilter, timelineFilter };
      },
      onError: (_e, _v, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
        }
      },
      onSuccess: (server, _, ctx) => {
        if (!ctx) return;
        setMapListServer(queryClient, ctx.mapListFilter, server.mapId, server.likeCount, server.hasLiked);
        setTimelineServer(queryClient, ctx.timelineFilter, server.mapId, server.likeCount, server.hasLiked);
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
        const timelineFilter = trpc.result.usersResultList.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfinite.infiniteQueryFilter();
        const activeUserMapsFilter = trpc.mapList.getActiveUserPlayingMaps.queryFilter();

        await queryClient.cancelQueries(mapInfoFilter);
        await queryClient.cancelQueries(mapListFilter);
        await queryClient.cancelQueries(timelineFilter);
        await queryClient.cancelQueries(notificationsFilter);
        await queryClient.cancelQueries(activeUserMapsFilter);

        const previous = [
          ...queryClient.getQueriesData(mapInfoFilter),
          ...queryClient.getQueriesData(mapListFilter),
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(notificationsFilter),
          ...queryClient.getQueriesData(activeUserMapsFilter),
        ];

        setMapInfoOptimistic(queryClient, mapInfoFilter, input.newState);
        setMapListOptimistic(queryClient, mapListFilter, input.mapId, input.newState);
        setTimelineOptimistic(queryClient, timelineFilter, input.mapId, input.newState);
        setNotificationsOptimistic(queryClient, notificationsFilter, input.mapId, input.newState);
        setActiveUsersOptimistic(queryClient, activeUserMapsFilter, input.mapId, input.newState);

        return { previous, mapInfoFilter, mapListFilter, timelineFilter, notificationsFilter, activeUserMapsFilter };
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
        setTimelineServer(queryClient, ctx.timelineFilter, mapId, likeCount, hasLiked);
        setNotificationsServer(queryClient, ctx.notificationsFilter, mapId, likeCount, hasLiked);
        setActiveUsersServer(queryClient, ctx.activeUserMapsFilter, mapId, likeCount, hasLiked);
      },
    }),
  );
}
