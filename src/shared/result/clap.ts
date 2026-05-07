import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInfiniteQueryCache, updateQueryCache } from "@/lib/react-query";
import type { ResultWithMapItem } from "@/server/api/routers/result/list";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";

type RankingItem = RouterOutputs["result"]["ranking"]["get"][number];

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

export function useToggleClapMutation() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.result.clap.toggleClap.mutationOptions({
      onMutate: async (input) => {
        const resultListFilter = trpc.result.list.pathFilter();
        const resultRankingFilter = trpc.result.ranking.pathFilter();

        await Promise.all([
          queryClient.cancelQueries(resultListFilter),
          queryClient.cancelQueries(resultRankingFilter),
        ]);

        const previous = [...queryClient.getQueriesData(resultListFilter)];
        const previousRanking = [...queryClient.getQueriesData(resultRankingFilter)];

        // --- Optimistic Updates ---
        const updater = createResultUpdater(input.resultId, { optimistic: input.newState });

        updateInfiniteQueryCache(queryClient, resultListFilter, updater.forResult);
        updateQueryCache(queryClient, resultListFilter, updater.forResult);

        updateQueryCache<RankingItem>(queryClient, resultRankingFilter, (item) => {
          if (item.id !== input.resultId) return item;
          return { ...item, clap: calculateClapState(item.clap, input.newState) };
        });

        return { previous, resultListFilter, previousRanking, resultRankingFilter };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) {
            queryClient.setQueryData(key, data);
          }
        }
        if (ctx?.previousRanking) {
          for (const [key, data] of ctx.previousRanking) {
            queryClient.setQueryData(key, data);
          }
        }
      },
      onSuccess: (server, _vars, ctx) => {
        const { clapCount, hasClapped, resultId } = server;

        // --- Server Updates ---
        const updater = createResultUpdater(resultId, { server: { count: clapCount, hasClapped } });

        updateQueryCache(queryClient, ctx.resultListFilter, updater.forResult);
        updateInfiniteQueryCache(queryClient, ctx.resultListFilter, updater.forResult);

        updateQueryCache<RankingItem>(queryClient, ctx.resultRankingFilter, (item) => {
          if (item.id !== resultId) return item;
          return { ...item, clap: { count: clapCount, hasClapped } };
        });
      },
    }),
  );
}
