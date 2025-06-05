import { useTRPC } from "@/trpc/trpc";

export const useMorphQueries = () => {
  const trpc = useTRPC();

  return {
    customDic: () =>
      trpc.morphConvert.getCustomDic.queryOptions(undefined, {
        staleTime: Infinity,
        gcTime: Infinity,
      }),

    tokenizeSentence: ({ sentence }: { sentence: string }) =>
      trpc.morphConvert.tokenizeWordAws.queryOptions(
        { sentence },
        {
          staleTime: Infinity,
          gcTime: Infinity,
        },
      ),
  };
};
