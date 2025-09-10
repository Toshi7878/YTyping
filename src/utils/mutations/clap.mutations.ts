import { ResultCardInfo } from "@/app/timeline/_lib/type";
import { useTRPC } from "@/trpc/provider";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useClapMutationTimeline() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  return useMutation(
    trpc.clap.toggleClap.mutationOptions({
      onMutate: async (input) => {
        await queryClient.cancelQueries({ queryKey: ["usersResultList"] });
        const previous = queryClient.getQueriesData({ queryKey: ["usersResultList"] });

        queryClient.setQueriesData<{ pages: ResultCardInfo[][]; pageParams: unknown[] }>(
          { queryKey: ["usersResultList"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) =>
                page.map((r) =>
                  r.id === input.resultId
                    ? {
                        ...r,
                        hasClap: input.optimisticState,
                        clap_count: input.optimisticState ? r.clap_count + 1 : Math.max(0, r.clap_count - 1),
                      }
                    : r,
                ),
              ),
            };
          },
        );

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
        queryClient.setQueriesData<{ pages: ResultCardInfo[][]; pageParams: unknown[] }>(
          { queryKey: ["usersResultList"] },
          (old) => {
            if (!old) return old;
            return {
              ...old,
              pages: old.pages.map((page) =>
                page.map((r) =>
                  r.id === server.resultId ? { ...r, hasClap: server.isClaped, clap_count: server.clapCount } : r,
                ),
              ),
            };
          },
        );
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
        await queryClient.cancelQueries(filter);
        const previous = queryClient.getQueriesData(filter);

        queryClient.setQueriesData<any>(filter, (old) => {
          if (!old) return old;
          return old.map((r: any) =>
            r.id === input.resultId
              ? {
                  ...r,
                  clap_count: input.optimisticState ? r.clap_count + 1 : Math.max(0, r.clap_count - 1),
                  claps: [{ is_claped: input.optimisticState }],
                }
              : r,
          );
        });

        return { previous, filter };
      },
      onError: (_err, _vars, ctx) => {
        if (ctx?.previous) {
          for (const [key, data] of ctx.previous) {
            queryClient.setQueryData(key, data);
          }
        }
      },
      onSuccess: (server, _vars, ctx) => {
        if (!ctx) return;
        queryClient.setQueriesData<any>(ctx.filter, (old) => {
          if (!old) return old;
          return old.map((r: any) =>
            r.id === server.resultId
              ? { ...r, clap_count: server.clapCount, claps: [{ is_claped: server.isClaped }] }
              : r,
          );
        });
      },
    }),
  );
}
