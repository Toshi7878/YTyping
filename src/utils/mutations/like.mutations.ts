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
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        maps: page.maps?.map((m: any) =>
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
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page: any) => ({
        ...page,
        maps: page.maps?.map((m: any) =>
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
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page: any[]) =>
        page?.map((r: any) =>
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
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page: any[]) =>
        page?.map((r: any) =>
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

        setMapListOptimistic(queryClient, predMapList, input.mapId, input.isLiked);
        setTimelineOptimistic(queryClient, predTimeline, input.mapId, input.isLiked);

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

export function useLikeMutationMapInfo() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.like.setLike.mutationOptions({
      onSuccess: (server, _vars, ctx) => {
        const predMapList = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "mapList";
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";
        setMapListServer(queryClient, predMapList, server.mapId, server.likeCount, server.isLiked);
        setTimelineServer(queryClient, predTimeline, server.mapId, server.likeCount, server.isLiked);
      },
    }),
  );
}
