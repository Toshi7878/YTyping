import { TimelineResult } from "@/app/timeline/_lib/type";
import { RouterOutPuts } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { InfiniteData, QueryFilters, useMutation, useQueryClient } from "@tanstack/react-query";

const predTimeline: QueryFilters["predicate"] = ({ queryKey }) => queryKey[0] === "usersResultList";
const predRanking: QueryFilters["predicate"] = ({ queryKey }) => queryKey[0] === "ranking.getMapRanking";

function setTimelineClapOptimistic(
  queryClient: ReturnType<typeof useQueryClient>,
  resultId: number,
  optimisticState: boolean,
) {
  queryClient.setQueriesData<InfiniteData<TimelineResult[]>>({ predicate: predTimeline }, (old) => {
    if (!old || !old.pages) return old;
    return {
      ...old,
      pages: old.pages.map((page) =>
        page.map((result) =>
          result.id === resultId
            ? {
                ...result,
                hasClap: optimisticState,
                clap_count: optimisticState ? result.clap_count + 1 : Math.max(0, result.clap_count - 1),
              }
            : result,
        ),
      ),
    };
  });
}

function setTimelineClapServer(
  queryClient: ReturnType<typeof useQueryClient>,
  resultId: number,
  isClaped: boolean,
  clapCount: number,
) {
  queryClient.setQueriesData<InfiniteData<TimelineResult[]>>({ predicate: predTimeline }, (old) => {
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
  queryClient.setQueriesData<RouterOutPuts["ranking"]["getMapRanking"]>(filter, (old) => {
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
  queryClient.setQueriesData<RouterOutPuts["ranking"]["getMapRanking"]>(filter, (old) => {
    if (!old) return old;
    return old.map((result) =>
      result.id === resultId ? { ...result, clap_count: clapCount, claps: [{ is_claped: isClaped }] } : result,
    );
  });
}

export function useClapMutationTimeline({ mapId }: { mapId: number }) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.clap.toggleClap.mutationOptions({
      onMutate: async (input) => {
        const mapRankingFilter = trpc.ranking.getMapRanking.queryFilter({ mapId });

        await queryClient.cancelQueries({ predicate: predTimeline });
        await queryClient.cancelQueries(mapRankingFilter);

        const previous = [
          ...queryClient.getQueriesData({ predicate: predTimeline }),
          ...queryClient.getQueriesData(mapRankingFilter),
        ];

        setTimelineClapOptimistic(queryClient, input.resultId, input.optimisticState);
        setRankingClapOptimistic(queryClient, mapRankingFilter, input.resultId, input.optimisticState);

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
        setTimelineClapServer(queryClient, server.resultId, server.isClaped, server.clapCount);
        setRankingClapServer(queryClient, ctx.mapRankingFilter, server.resultId, server.isClaped, server.clapCount);
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
        const mapRankingFilter = trpc.ranking.getMapRanking.queryFilter({ mapId });

        await queryClient.cancelQueries(mapRankingFilter);
        await queryClient.cancelQueries({ predicate: predTimeline });

        const previous = queryClient.getQueriesData(mapRankingFilter);
        const previousTimeline = queryClient.getQueriesData({ predicate: predTimeline });

        setRankingClapOptimistic(queryClient, mapRankingFilter, input.resultId, input.optimisticState);
        setTimelineClapOptimistic(queryClient, input.resultId, input.optimisticState);

        return { previous, mapRankingFilter, previousTimeline };
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
        setRankingClapServer(queryClient, ctx.mapRankingFilter, server.resultId, server.isClaped, server.clapCount);
        setTimelineClapServer(queryClient, server.resultId, server.isClaped, server.clapCount);
      },
    }),
  );
}
