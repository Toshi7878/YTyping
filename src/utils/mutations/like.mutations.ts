import { RouterOutPuts } from "@/server/api/trpc";
import type { Trpc } from "@/trpc/provider";
import { useTRPC } from "@/trpc/provider";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

type MapListFilter = ReturnType<Trpc["mapList"]["getList"]["infiniteQueryFilter"]>;
type TimeLineFilter = ReturnType<Trpc["result"]["usersResultList"]["infiniteQueryFilter"]>;
type ActiveUserMapsFilter = ReturnType<Trpc["mapList"]["getActiveUserPlayingMaps"]["queryFilter"]>;
type NotificationsMapFilter = ReturnType<Trpc["notification"]["getInfiniteUserNotifications"]["infiniteQueryFilter"]>;

function setMapListOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapListFilter,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["mapList"]["getList"]>>(filter, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        maps: page.maps.map((map) =>
          map.id === mapId
            ? {
                ...map,
                likeCount: optimisticState ? map.likeCount + 1 : Math.max(0, map.likeCount - 1),
                hasLiked: optimisticState,
              }
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
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        maps: page.maps.map((map) => (map.id === mapId ? { ...map, likeCount, hasLiked } : map)),
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
    if (!old || !old.pages) return old;
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
                  likeCount: optimisticState ? result.map.likeCount + 1 : Math.max(0, result.map.likeCount - 1),
                  hasLiked: optimisticState,
                },
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
  isLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["usersResultList"]>>(filter, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((result) =>
          result.map.id === mapId
            ? {
                ...result,
                map: { ...result.map, likeCount: likeCount, hasLiked: isLiked },
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
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["notification"]["getInfiniteUserNotifications"]>>(
    filter,
    (old) => {
      if (!old || !old.pages) return old;
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
                    hasLiked: optimisticState,
                    likeCount: optimisticState ? n.map.likeCount + 1 : Math.max(0, n.map.likeCount - 1),
                  },
                }
              : n,
          ),
        })),
      };
    },
  );
}

function setNotificationsServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: NotificationsMapFilter,
  mapId: number,
  likeCount: number,
  isLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["notification"]["getInfiniteUserNotifications"]>>(
    filter,
    (old) => {
      if (!old || !old.pages) return old;
      return {
        ...old,
        pages: old.pages.map((page) => ({
          ...page,
          notifications: page.notifications.map((map) =>
            map.map.id === mapId ? { ...map, map: { ...map.map, is_liked: isLiked, like_count: likeCount } } : map,
          ),
        })),
      };
    },
  );
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
              hasLiked: optimisticState,
              likeCount: optimisticState ? user.map.likeCount + 1 : Math.max(0, user.map.likeCount - 1),
            },
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
  isLiked: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["mapList"]["getActiveUserPlayingMaps"]>(filter, (old) => {
    if (!old) return old;
    return old.map((user) =>
      user.map?.id === mapId ? { ...user, map: { ...user.map, hasLiked: isLiked, likeCount } } : user,
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
    } as typeof old;
  });
}

function setMapInfoServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: ReturnType<Trpc["map"]["getMapInfo"]["queryFilter"]>,
  serverHasLiked: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["map"]["getMapInfo"]>(filter, (old) => {
    if (!old) return old;
    return {
      ...old,
      hasLiked: serverHasLiked,
    } as typeof old;
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
        const notificationsFilter = trpc.notification.getInfiniteUserNotifications.infiniteQueryFilter();
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
        setMapListServer(queryClient, ctx.mapListFilter, server.mapId, server.likeCount, server.isLiked);
        setTimelineServer(queryClient, ctx.timelineFilter, server.mapId, server.likeCount, server.isLiked);
        setNotificationsServer(queryClient, ctx.notificationsFilter, server.mapId, server.likeCount, server.isLiked);
        setActiveUsersServer(queryClient, ctx.activeUserMapsFilter, server.mapId, server.likeCount, server.isLiked);
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
        const notificationsFilter = trpc.notification.getInfiniteUserNotifications.infiniteQueryFilter();
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
        // server: { mapId, likeCount, isLiked }
        setMapInfoServer(queryClient, ctx.mapInfoFilter, server.isLiked);
        setMapListServer(queryClient, ctx.mapListFilter, server.mapId, server.likeCount, server.isLiked);
        setTimelineServer(queryClient, ctx.timelineFilter, server.mapId, server.likeCount, server.isLiked);
        setNotificationsServer(queryClient, ctx.notificationsFilter, server.mapId, server.likeCount, server.isLiked);
        setActiveUsersServer(queryClient, ctx.activeUserMapsFilter, server.mapId, server.likeCount, server.isLiked);
      },
    }),
  );
}
