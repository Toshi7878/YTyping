import { RouterOutPuts, Trpc } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { InfiniteData, useMutation, useQueryClient } from "@tanstack/react-query";

type MapListFilter = ReturnType<Trpc["mapList"]["getList"]["infiniteQueryFilter"]>;
type TimeLineFilter = ReturnType<Trpc["result"]["usersResultList"]["infiniteQueryFilter"]>;
type ActiveUserMapsFilter = ReturnType<Trpc["activeUser"]["getUserPlayingMaps"]["queryFilter"]>;
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
                like_count: optimisticState ? map.like_count + 1 : Math.max(0, map.like_count - 1),
                is_liked: optimisticState,
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
  isLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["mapList"]["getList"]>>(filter, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        maps: page.maps.map((map) => (map.id === mapId ? { ...map, like_count: likeCount, is_liked: isLiked } : map)),
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
                  like_count: optimisticState ? result.map.like_count + 1 : Math.max(0, result.map.like_count - 1),
                  is_liked: optimisticState,
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
                map: { ...result.map, like_count: likeCount, is_liked: isLiked },
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
                    is_liked: optimisticState,
                    like_count: optimisticState ? n.map.like_count + 1 : Math.max(0, n.map.like_count - 1),
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
  queryClient.setQueriesData<RouterOutPuts["activeUser"]["getUserPlayingMaps"]>(filter, (old) => {
    if (!old) return old;
    return old.map((user) =>
      user.map?.id === mapId
        ? {
            ...user,
            map: {
              ...user.map,
              is_liked: optimisticState,
              like_count: optimisticState ? user.map.like_count + 1 : Math.max(0, user.map.like_count - 1),
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
  queryClient.setQueriesData<RouterOutPuts["activeUser"]["getUserPlayingMaps"]>(filter, (old) => {
    if (!old) return old;
    return old.map((user) =>
      user.map?.id === mapId ? { ...user, map: { ...user.map, is_liked: isLiked, like_count: likeCount } } : user,
    );
  });
}

export function useLikeMutationMapList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.like.setLike.mutationOptions({
      onMutate: async (input) => {
        const mapListFilter = trpc.mapList.getList.infiniteQueryFilter();
        const timelineFilter = trpc.result.usersResultList.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfiniteUserNotifications.infiniteQueryFilter();
        const activeUserMapsFilter = trpc.activeUser.getUserPlayingMaps.queryFilter();

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

        setMapListOptimistic(queryClient, mapListFilter, input.mapId, input.likeValue);
        setTimelineOptimistic(queryClient, timelineFilter, input.mapId, input.likeValue);
        setNotificationsOptimistic(queryClient, notificationsFilter, input.mapId, input.likeValue);
        setActiveUsersOptimistic(queryClient, activeUserMapsFilter, input.mapId, input.likeValue);

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
    trpc.like.setLike.mutationOptions({
      onSuccess: (server, _vars) => {
        const mapListFilter = trpc.mapList.getList.infiniteQueryFilter();
        const timelineFilter = trpc.result.usersResultList.infiniteQueryFilter();
        const notificationsFilter = trpc.notification.getInfiniteUserNotifications.infiniteQueryFilter();
        const activeUserMapsFilter = trpc.activeUser.getUserPlayingMaps.queryFilter();

        setMapListServer(queryClient, mapListFilter, server.mapId, server.likeCount, server.isLiked);
        setTimelineServer(queryClient, timelineFilter, server.mapId, server.likeCount, server.isLiked);
        setNotificationsServer(queryClient, notificationsFilter, server.mapId, server.likeCount, server.isLiked);
        setActiveUsersServer(queryClient, activeUserMapsFilter, server.mapId, server.likeCount, server.isLiked);
      },
    }),
  );
}
