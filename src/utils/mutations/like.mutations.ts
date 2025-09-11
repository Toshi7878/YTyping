import { useTRPC } from "@/trpc/provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// helpers
function setMapListOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (q: any) => boolean,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<any>({ predicate }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        maps: page.maps.map((m: any) =>
          m.id === mapId
            ? {
                ...m,
                like_count: optimisticState ? m.like_count + 1 : Math.max(0, m.like_count - 1),
                map_likes: [{ is_liked: optimisticState }],
              }
            : m,
        ),
      })),
    };
  });
}

function setMapListServer(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (q: any) => boolean,
  mapId: number,
  likeCount: number,
  isLiked: boolean,
) {
  queryClient.setQueriesData<any>({ predicate }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        maps: page.maps.map((m: any) =>
          m.id === mapId ? { ...m, like_count: likeCount, map_likes: [{ is_liked: isLiked }] } : m,
        ),
      })),
    };
  });
}

function setTimelineOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (q: any) => boolean,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<any>({ predicate }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page: any[]) =>
        page.map((r: any) =>
          r.map?.id === mapId
            ? {
                ...r,
                map: {
                  ...r.map,
                  like_count: optimisticState ? r.map.like_count + 1 : Math.max(0, r.map.like_count - 1),
                  map_likes: [{ is_liked: optimisticState }],
                },
              }
            : r,
        ),
      ),
    };
  });
}

function setTimelineServer(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (q: any) => boolean,
  mapId: number,
  likeCount: number,
  isLiked: boolean,
) {
  queryClient.setQueriesData<any>({ predicate }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page: any[]) =>
        page.map((r: any) =>
          r.map?.id === mapId
            ? {
                ...r,
                map: { ...r.map, like_count: likeCount, map_likes: [{ is_liked: isLiked }] },
              }
            : r,
        ),
      ),
    };
  });
}

function setGetMapInfoOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: any,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData(filter, (old) => {
    if (!old) return old;
    const m = old as any;
    if (!m || m.id !== mapId) return old;
    return {
      ...m,
      like_count: optimisticState ? m.like_count + 1 : Math.max(0, m.like_count - 1),
      map_likes: [{ is_liked: optimisticState }],
    };
  });
}

function setGetMapInfoServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: any,
  mapId: number,
  likeCount: number,
  isLiked: boolean,
) {
  queryClient.setQueriesData(filter, (old) => {
    if (!old) return old;
    const m = old as any;
    if (!m || m.id !== mapId) return old;
    return { ...m, like_count: likeCount, map_likes: [{ is_liked: isLiked }] };
  });
}

export function useLikeMutationMapList() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.like.setLike.mutationOptions({
      onMutate: async (input) => {
        const predMapList = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "mapList";
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";

        await queryClient.cancelQueries({ predicate: predMapList });
        await queryClient.cancelQueries({ predicate: predTimeline });

        const previous = [
          ...queryClient.getQueriesData({ predicate: predMapList }),
          ...queryClient.getQueriesData({ predicate: predTimeline }),
        ];

        setMapListOptimistic(queryClient, predMapList, input.mapId, input.optimisticState);
        setTimelineOptimistic(queryClient, predTimeline, input.mapId, input.optimisticState);

        return { previous };
      },
      onError: (_e, _v, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
        }
      },
      onSuccess: (server) => {
        const predMapList = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "mapList";
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";

        setMapListServer(queryClient, predMapList, server.mapId, server.likeCount, server.isLiked);
        setTimelineServer(queryClient, predTimeline, server.mapId, server.likeCount, server.isLiked);
      },
    }),
  );
}

export function useLikeMutationMapInfo(mapId: number) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.like.setLike.mutationOptions({
      onMutate: async (input) => {
        const filterGetMapInfo = trpc.map.getMapInfo.queryFilter({ mapId });
        const predMapList = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "mapList";
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";

        await queryClient.cancelQueries(filterGetMapInfo);
        await queryClient.cancelQueries({ predicate: predMapList });
        await queryClient.cancelQueries({ predicate: predTimeline });

        const prevGetMapInfo = queryClient.getQueriesData(filterGetMapInfo);
        const prevMapList = queryClient.getQueriesData({ predicate: predMapList });
        const prevTimeline = queryClient.getQueriesData({ predicate: predTimeline });

        setGetMapInfoOptimistic(queryClient, filterGetMapInfo, input.mapId, input.optimisticState);
        setMapListOptimistic(queryClient, predMapList, input.mapId, input.optimisticState);
        setTimelineOptimistic(queryClient, predTimeline, input.mapId, input.optimisticState);

        return { prevGetMapInfo, filterGetMapInfo, prevMapList, prevTimeline } as const;
      },
      onError: (_e, _v, ctx) => {
        if (!ctx) return;
        for (const [key, data] of ctx.prevGetMapInfo) queryClient.setQueryData(key, data);
        for (const [key, data] of ctx.prevMapList) queryClient.setQueryData(key, data);
        for (const [key, data] of ctx.prevTimeline) queryClient.setQueryData(key, data);
      },
      onSuccess: (server, _vars, ctx) => {
        if (!ctx) return;
        setGetMapInfoServer(queryClient, ctx.filterGetMapInfo, server.mapId, server.likeCount, server.isLiked);

        const predMapList = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "mapList";
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";
        setMapListServer(queryClient, predMapList, server.mapId, server.likeCount, server.isLiked);
        setTimelineServer(queryClient, predTimeline, server.mapId, server.likeCount, server.isLiked);
      },
    }),
  );
}
