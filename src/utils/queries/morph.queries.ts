import { useTRPC } from "@/trpc/provider"

export const useMorphQueries = () => {
  const trpc = useTRPC()

  return {
    customDic: () =>
      trpc.morphConvert.getCustomDict.queryOptions(undefined, {
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
  }
}
