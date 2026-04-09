import { replaceReadingWithCustomDict } from "@/lib/build-map/replace-reading-with-custom-dict";
import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";

export const ensureLyricsWithReadings = async (comparisonLyrics: string[][]) => {
  const trpc = getTRPCOptionsProxy();
  const queryClient = getQueryClient();

  const data = await queryClient.ensureQueryData(
    trpc.morph.tokenizeSentence.queryOptions(
      { sentence: comparisonLyrics.flat().join(" ") },
      { staleTime: Infinity, gcTime: Infinity },
    ),
  );

  // selectの変換をensureQueryDataの外で行う
  return await replaceReadingWithCustomDict(data);
};
