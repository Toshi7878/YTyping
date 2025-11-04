import { useTRPC } from "@/trpc/provider";

export const useMorphQueries = () => {
  const trpc = useTRPC();

  return {
    tokenizeSentence: ({ sentence }: { sentence: string }) =>
      trpc.morphConvert.tokenizeSentence.queryOptions({ sentence }, { staleTime: Infinity, gcTime: Infinity }),
  };
};
