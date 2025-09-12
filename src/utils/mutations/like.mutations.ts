import { TimelineResult } from "@/app/timeline/_lib/type";
import { useTRPC } from "@/trpc/provider";
import { InfiniteData, QueryFilters, useMutation, useQueryClient } from "@tanstack/react-query";
import { MapListResponse } from "../queries/mapList.queries";

const predMapList: QueryFilters["predicate"] = ({ queryKey }) => queryKey[0] === "mapList";
const predTimeline: QueryFilters["predicate"] = ({ queryKey }) => queryKey[0] === "usersResultList";

function setMapListOptimistic(queryClient: ReturnType<typeof useQueryClient>, mapId: number, optimisticState: boolean) {
  queryClient.setQueriesData<InfiniteData<MapListResponse>>({ predicate: predMapList }, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        maps: page.maps?.map((map) =>
          map.id === mapId
            ? {
                ...map,
                like_count: optimisticState ? map.like_count + 1 : Math.max(0, map.like_count - 1),
                map_likes: [{ is_liked: optimisticState }],
              }
            : map,
        ),
      })),
    };
  });
}

function setMapListServer(
  queryClient: ReturnType<typeof useQueryClient>,
  mapId: number,
  likeCount: number,
  isLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<MapListResponse>>({ predicate: predMapList }, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        maps: page.maps?.map((map) =>
          map.id === mapId ? { ...map, like_count: likeCount, map_likes: [{ is_liked: isLiked }] } : map,
        ),
      })),
    };
  });
}

function setTimelineOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  mapId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<TimelineResult[]>>({ predicate: predTimeline }, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page: any[]) =>
        page?.map((result: any) =>
          result.map?.id === mapId
            ? {
                ...result,
                map: {
                  ...result.map,
                  like_count: optimisticState ? result.map.like_count + 1 : Math.max(0, result.map.like_count - 1),
                  map_likes: [{ is_liked: optimisticState }],
                },
              }
            : result,
        ),
      ),
    };
  });
}

function setTimelineServer(
  queryClient: ReturnType<typeof useQueryClient>,
  mapId: number,
  likeCount: number,
  isLiked: boolean,
) {
  queryClient.setQueriesData<InfiniteData<TimelineResult[]>>({ predicate: predTimeline }, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        page?.map((result) =>
          result.map?.id === mapId
            ? {
                ...result,
                map: { ...result.map, like_count: likeCount, map_likes: [{ is_liked: isLiked }] },
              }
            : result,
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
        await queryClient.cancelQueries({ predicate: predMapList });
        await queryClient.cancelQueries({ predicate: predTimeline });

        const previous = [
          ...queryClient.getQueriesData({ predicate: predMapList }),
          ...queryClient.getQueriesData({ predicate: predTimeline }),
        ];

        setMapListOptimistic(queryClient, input.mapId, input.likeValue);
        setTimelineOptimistic(queryClient, input.mapId, input.likeValue);

        return { previous };
      },
      onError: (_e, _v, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) queryClient.setQueryData(key, data);
        }
      },
      onSuccess: (server) => {
        setMapListServer(queryClient, server.mapId, server.likeCount, server.isLiked);
        setTimelineServer(queryClient, server.mapId, server.likeCount, server.isLiked);
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
        setMapListServer(queryClient, server.mapId, server.likeCount, server.isLiked);
        setTimelineServer(queryClient, server.mapId, server.likeCount, server.isLiked);
      },
    }),
  );
}
