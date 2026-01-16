import { replaceReadingWithCustomDict } from "@/lib/build-map/replace-reading-with-custom-dict";
import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";

export const generateLyricsWithReadings = async (comparisonLyrics: string[][]) => {
  const queryClient = getQueryClient();
  const trpc = getTRPCOptionsProxy();
  return await queryClient.ensureQueryData(
    trpc.morph.tokenizeSentence.queryOptions(
      { sentence: comparisonLyrics.flat().join(" ") },
      {
        staleTime: Infinity,
        gcTime: Infinity,
        select: async (data) => await replaceReadingWithCustomDict(data),
      },
    ),
  );
};
