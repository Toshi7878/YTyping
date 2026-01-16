import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ResultWithMapItem } from "@/server/api/routers/result/list";
import { useTRPC } from "@/trpc/provider";
import { updateInfiniteQueryCache, updateQueryCache } from "../update-query-cache";

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

        await Promise.all([queryClient.cancelQueries(resultListFilter)]);

        const previous = [...queryClient.getQueriesData(resultListFilter)];

        // --- Optimistic Updates ---
        const updater = createResultUpdater(input.resultId, { optimistic: input.newState });

        updateInfiniteQueryCache(queryClient, resultListFilter, updater.forResult);
        updateQueryCache(queryClient, resultListFilter, updater.forResult);

        return { previous, resultListFilter };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) {
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
      },
    }),
  );
}
