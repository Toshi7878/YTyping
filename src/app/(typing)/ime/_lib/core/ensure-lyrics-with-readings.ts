import { getQueryClient, orpc } from "@/orpc/provider";
import { replaceReadingWithCustomDict } from "@/shared/morph/replace-reading-with-custom-dict";

export const ensureLyricsWithReadings = async (comparisonLyrics: string[][]) => {
  const queryClient = getQueryClient();

  const data = await queryClient.ensureQueryData(
    orpc.morph.tokenizeSentence.queryOptions({
      input: { sentence: comparisonLyrics.flat().join(" ") },
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  );

  // selectの変換をensureQueryDataの外で行う
  return await replaceReadingWithCustomDict(data);
};
