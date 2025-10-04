import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ResultWithMapItem } from "@/server/api/routers/result";
import type { RouterOutPuts } from "@/server/api/trpc";
import type { Trpc } from "@/trpc/provider";
import { useTRPC } from "@/trpc/provider";

type MapRankingFilter = ReturnType<Trpc["result"]["getMapRanking"]["queryFilter"]>;
type TimelineFilter = ReturnType<Trpc["result"]["getAllWithMap"]["infiniteQueryFilter"]>;
type UserResultsFilter = ReturnType<Trpc["result"]["getAllWithMapByUserId"]["infiniteQueryFilter"]>;

function setTimelineClapOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: TimelineFilter,
  resultId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["getAllWithMap"]>>(filter, (old) => {
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
                } satisfies ResultWithMapItem["clap"],
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
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["getAllWithMap"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((result) =>
          result.id === resultId
            ? { ...result, clap: { hasClapped, count: clapCount } satisfies ResultWithMapItem["clap"] }
            : result,
        ),
      })),
    };
  });
}

function setUserResultsClapOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: UserResultsFilter,
  resultId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["getAllWithMapByUserId"]>>(filter, (old) => {
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
                } satisfies ResultWithMapItem["clap"],
              }
            : result,
        ),
      })),
    };
  });
}

function setUserResultsClapServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: UserResultsFilter,
  resultId: number,
  hasClapped: boolean,
  clapCount: number,
) {
  queryClient.setQueriesData<InfiniteData<RouterOutPuts["result"]["getAllWithMapByUserId"]>>(filter, (old) => {
    if (!old?.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) => ({
        ...page,
        items: page.items.map((result) =>
          result.id === resultId
            ? { ...result, clap: { hasClapped, count: clapCount } satisfies ResultWithMapItem["clap"] }
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
            } satisfies ResultWithMapItem["clap"],
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
            clap: { hasClapped, count: clapCount } satisfies ResultWithMapItem["clap"],
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
        const timelineFilter = trpc.result.getAllWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.result.getAllWithMapByUserId.infiniteQueryFilter();

        await queryClient.cancelQueries(timelineFilter);
        await queryClient.cancelQueries(userResultsFilter);

        const previous = [
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(userResultsFilter),
        ];

        setTimelineClapOptimistic(queryClient, timelineFilter, input.resultId, input.newState);
        setUserResultsClapOptimistic(queryClient, userResultsFilter, input.resultId, input.newState);

        return { previous, timelineFilter, userResultsFilter };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) {
            queryClient.setQueryData(key, data);
          }
        }
      },
      onSuccess: (server, _vars, ctx) => {
        const { clapCount, hasClapped, mapId, resultId } = server;
        const mapRankingFilter = trpc.result.getMapRanking.queryFilter({ mapId });
        setRankingClapServer(queryClient, mapRankingFilter, resultId, hasClapped, clapCount);

        if (!ctx) return;
        setTimelineClapServer(queryClient, ctx.timelineFilter, resultId, hasClapped, clapCount);
        setUserResultsClapServer(queryClient, ctx.userResultsFilter, resultId, hasClapped, clapCount);
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
        const timelineFilter = trpc.result.getAllWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.result.getAllWithMapByUserId.infiniteQueryFilter();

        setTimelineClapServer(queryClient, timelineFilter, server.resultId, server.hasClapped, server.clapCount);
        setUserResultsClapServer(queryClient, userResultsFilter, server.resultId, server.hasClapped, server.clapCount);
        if (!ctx) return;
        setRankingClapServer(queryClient, ctx.mapRankingFilter, server.resultId, server.hasClapped, server.clapCount);
      },
    }),
  );
}
