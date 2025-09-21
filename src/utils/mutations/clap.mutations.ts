import type { ResultListItem } from "@/server/api/routers/result";
import type { RouterOutPuts } from "@/server/api/trpc";
import type { Trpc } from "@/trpc/provider";
import { useTRPC } from "@/trpc/provider";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type MapRankingFilter = ReturnType<Trpc["result"]["getMapRanking"]["queryFilter"]>;
type TimelineFilter = ReturnType<Trpc["result"]["usersResultList"]["infiniteQueryFilter"]>;

function setTimelineClapOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: TimelineFilter,
  resultId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["usersResultList"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((result) =>
          result.id === resultId
            ? {
                ...result,
                clap: {
                  count: optimisticState ? result.clap.count + 1 : Math.max(0, result.clap.count - 1),
                  hasClapped: optimisticState,
                } satisfies ResultListItem["clap"],
              }
            : result,
        ),
      })),
    };
  });
}

function setTimelineClapServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: TimelineFilter,
  resultId: number,
  hasClapped: boolean,
  clapCount: number,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["usersResultList"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((result) =>
          result.id === resultId
            ? { ...result, clap: { hasClapped, count: clapCount } satisfies ResultListItem["clap"] }
            : result,
        ),
      })),
    };
  });
}

function setRankingClapOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapRankingFilter,
  resultId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<RouterOutPuts["result"]["getMapRanking"]>(filter, (old) => {
    if (!old) return old;
    return old.map((result) =>
      result.id === resultId
        ? {
            ...result,
            clap: {
              hasClapped: optimisticState,
              count: optimisticState ? result.clap.count + 1 : Math.max(0, result.clap.count - 1),
            } satisfies ResultListItem["clap"],
          }
        : result,
    );
  });
}

function setRankingClapServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: MapRankingFilter,
  resultId: number,
  hasClapped: boolean,
  clapCount: number,
) {
  queryClient.setQueriesData<RouterOutPuts["result"]["getMapRanking"]>(filter, (old) => {
    if (!old) return old;
    return old.map((result) =>
      result.id === resultId
        ? {
            ...result,
            clap: { hasClapped, count: clapCount } satisfies ResultListItem["clap"],
          }
        : result,
    );
  });
}

export function useClapMutationTimeline() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.clap.toggleClap.mutationOptions({
      onMutate: async (input) => {
        const timelineFilter = trpc.result.usersResultList.infiniteQueryFilter();

        await queryClient.cancelQueries(timelineFilter);

        const previous = [...queryClient.getQueriesData(timelineFilter)];

        setTimelineClapOptimistic(queryClient, timelineFilter, input.resultId, input.newState);

        return { previous, timelineFilter };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) {
            queryClient.setQueryData(key, data);
          }
        }
      },
      onSuccess: (server, _vars, ctx) => {
        const { clapCount, hasClapped: hasClapped, mapId, resultId } = server;
        const mapRankingFilter = trpc.result.getMapRanking.queryFilter({ mapId });
        setRankingClapServer(queryClient, mapRankingFilter, resultId, hasClapped, clapCount);

        if (!ctx) return;
        setTimelineClapServer(queryClient, ctx.timelineFilter, resultId, hasClapped, clapCount);
      },
    }),
  );
}

export function useClapMutationRanking(mapId: number) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.clap.toggleClap.mutationOptions({
      onMutate: async (input) => {
        const mapRankingFilter = trpc.result.getMapRanking.queryFilter({ mapId });

        await queryClient.cancelQueries(mapRankingFilter);
        const previous = queryClient.getQueriesData(mapRankingFilter);

        setRankingClapOptimistic(queryClient, mapRankingFilter, input.resultId, input.newState);

        return { previous, mapRankingFilter };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) {
            queryClient.setQueryData(key, data);
          }
        }
      },
      onSuccess: (server, _vars, ctx) => {
        const timelineFilter = trpc.result.usersResultList.infiniteQueryFilter();

        setTimelineClapServer(queryClient, timelineFilter, server.resultId, server.hasClapped, server.clapCount);
        if (!ctx) return;
        setRankingClapServer(queryClient, ctx.mapRankingFilter, server.resultId, server.hasClapped, server.clapCount);
      },
    }),
  );
}
