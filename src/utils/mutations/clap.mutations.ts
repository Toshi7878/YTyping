import { ResultCardInfo } from "@/app/timeline/_lib/type";
import { useTRPC } from "@/trpc/provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// helpers
function setTimelineClapOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (q: any) => boolean,
  resultId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<{ pages: ResultCardInfo[][]; pageParams: unknown[] }>({ predicate }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        page.map((r) =>
          r.id === resultId
            ? {
                ...r,
                hasClap: optimisticState,
                clap_count: optimisticState ? r.clap_count + 1 : Math.max(0, r.clap_count - 1),
              }
            : r,
        ),
      ),
    };
  });
}

function setTimelineClapServer(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (q: any) => boolean,
  resultId: number,
  isClaped: boolean,
  clapCount: number,
) {
  queryClient.setQueriesData<{ pages: ResultCardInfo[][]; pageParams: unknown[] }>({ predicate }, (old) => {
    if (!old) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        page.map((r) => (r.id === resultId ? { ...r, hasClap: isClaped, clap_count: clapCount } : r)),
      ),
    };
  });
}

function setRankingClapOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: any,
  resultId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<any>(filter, (old) => {
    if (!old) return old;
    return old.map((r: any) =>
      r.id === resultId
        ? {
            ...r,
            clap_count: optimisticState ? r.clap_count + 1 : Math.max(0, r.clap_count - 1),
            claps: [{ is_claped: optimisticState }],
          }
        : r,
    );
  });
}

function setRankingClapServer(
  queryClient: ReturnType<typeof useQueryClient>,
  filter: any,
  resultId: number,
  isClaped: boolean,
  clapCount: number,
) {
  queryClient.setQueriesData<any>(filter, (old) => {
    if (!old) return old;
    return old.map((r: any) =>
      r.id === resultId ? { ...r, clap_count: clapCount, claps: [{ is_claped: isClaped }] } : r,
    );
  });
}

function setRankingByPredicateOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (q: any) => boolean,
  resultId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<any>({ predicate }, (old) => {
    if (!old) return old;
    return old.map((r: any) =>
      r.id === resultId
        ? {
            ...r,
            clap_count: optimisticState ? r.clap_count + 1 : Math.max(0, r.clap_count - 1),
            claps: [{ is_claped: optimisticState }],
          }
        : r,
    );
  });
}

function setRankingByPredicateServer(
  queryClient: ReturnType<typeof useQueryClient>,
  predicate: (q: any) => boolean,
  resultId: number,
  isClaped: boolean,
  clapCount: number,
) {
  queryClient.setQueriesData<any>({ predicate }, (old) => {
    if (!old) return old;
    return old.map((r: any) =>
      r.id === resultId ? { ...r, clap_count: clapCount, claps: [{ is_claped: isClaped }] } : r,
    );
  });
}

export function useClapMutationTimeline() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.clap.toggleClap.mutationOptions({
      onMutate: async (input) => {
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";
        const predRanking = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "ranking.getMapRanking";

        await queryClient.cancelQueries({ predicate: predTimeline });
        await queryClient.cancelQueries({ predicate: predRanking });

        const previous = [
          ...queryClient.getQueriesData({ predicate: predTimeline }),
          ...queryClient.getQueriesData({ predicate: predRanking }),
        ];

        setTimelineClapOptimistic(queryClient, predTimeline, input.resultId, input.optimisticState);
        setRankingByPredicateOptimistic(queryClient, predRanking, input.resultId, input.optimisticState);

        return { previous };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) {
            queryClient.setQueryData(key, data);
          }
        }
      },
      onSuccess: (server) => {
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";
        const predRanking = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "ranking.getMapRanking";
        setTimelineClapServer(queryClient, predTimeline, server.resultId, server.isClaped, server.clapCount);
        setRankingByPredicateServer(queryClient, predRanking, server.resultId, server.isClaped, server.clapCount);
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
        const filter = trpc.ranking.getMapRanking.queryFilter({ mapId });
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";

        await queryClient.cancelQueries(filter);
        await queryClient.cancelQueries({ predicate: predTimeline });

        const previous = queryClient.getQueriesData(filter);
        const previousTimeline = queryClient.getQueriesData({ predicate: predTimeline });

        setRankingClapOptimistic(queryClient, filter, input.resultId, input.optimisticState);
        setTimelineClapOptimistic(queryClient, predTimeline, input.resultId, input.optimisticState);

        return { previous, filter, previousTimeline };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) {
            queryClient.setQueryData(key, data);
          }
        }
        if (ctx?.previousTimeline) {
          for (const [key, data] of ctx.previousTimeline) {
            queryClient.setQueryData(key, data);
          }
        }
      },
      onSuccess: (server, _vars, ctx) => {
        if (!ctx) return;
        const predTimeline = (q: any) => Array.isArray(q.queryKey) && q.queryKey[0] === "usersResultList";
        setRankingClapServer(queryClient, ctx.filter, server.resultId, server.isClaped, server.clapCount);
        setTimelineClapServer(queryClient, predTimeline, server.resultId, server.isClaped, server.clapCount);
      },
    }),
  );
}
