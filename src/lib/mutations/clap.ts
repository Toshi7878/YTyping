import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ResultWithMapItem } from "@/server/api/routers/result";
import { useTRPC } from "@/trpc/provider";
import {
  updateInfiniteQuery as updateInfiniteQueryCache,
  updateListQuery as updateListQueryCache,
} from "../update-query-cache";

function calculateClapState(
  current: { count: number; hasClapped: boolean },
  optimisticState?: boolean,
  serverState?: { count: number; hasClapped: boolean },
) {
  if (serverState) return serverState;
  if (optimisticState !== undefined) {
    return {
      count: optimisticState ? current.count + 1 : Math.max(0, current.count - 1),
      hasClapped: optimisticState,
    };
  }
  return current;
}

const createResultUpdater = (
  resultId: number,
  newState: { optimistic?: boolean; server?: { count: number; hasClapped: boolean } },
) => {
  const updateResult = (result: ResultWithMapItem): ResultWithMapItem => {
    if (result.id !== resultId) return result;
    return {
      ...result,
      clap: calculateClapState(result.clap, newState.optimistic, newState.server),
    };
  };

  return { forResult: updateResult };
};

export function useClapMutationTimeline() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.clap.toggleClap.mutationOptions({
      onMutate: async (input) => {
        const timelineFilter = trpc.result.getAllWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.result.getAllWithMapByUserId.infiniteQueryFilter();

        await Promise.all([queryClient.cancelQueries(timelineFilter), queryClient.cancelQueries(userResultsFilter)]);

        const previous = [
          ...queryClient.getQueriesData(timelineFilter),
          ...queryClient.getQueriesData(userResultsFilter),
        ];

        // --- Optimistic Updates ---
        const updater = createResultUpdater(input.resultId, { optimistic: input.newState });

        updateInfiniteQueryCache(queryClient, timelineFilter, updater.forResult);
        updateInfiniteQueryCache(queryClient, userResultsFilter, updater.forResult);

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

        // --- Server Updates ---
        const updater = createResultUpdater(resultId, { server: { count: clapCount, hasClapped } });

        const mapRankingFilter = trpc.result.getMapRanking.queryFilter({ mapId });
        updateListQueryCache(queryClient, mapRankingFilter, updater.forResult);

        if (!ctx) return;
        updateInfiniteQueryCache(queryClient, ctx.timelineFilter, updater.forResult);
        updateInfiniteQueryCache(queryClient, ctx.userResultsFilter, updater.forResult);
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

        // --- Optimistic Updates ---
        const updater = createResultUpdater(input.resultId, { optimistic: input.newState });

        updateListQueryCache(queryClient, mapRankingFilter, updater.forResult);

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
        // --- Server Updates ---
        const updater = createResultUpdater(server.resultId, {
          server: { count: server.clapCount, hasClapped: server.hasClapped },
        });

        const timelineFilter = trpc.result.getAllWithMap.infiniteQueryFilter();
        const userResultsFilter = trpc.result.getAllWithMapByUserId.infiniteQueryFilter();

        updateInfiniteQueryCache(queryClient, timelineFilter, updater.forResult);
        updateInfiniteQueryCache(queryClient, userResultsFilter, updater.forResult);

        if (!ctx) return;
        updateListQueryCache(queryClient, ctx.mapRankingFilter, updater.forResult);
      },
    }),
  );
}
