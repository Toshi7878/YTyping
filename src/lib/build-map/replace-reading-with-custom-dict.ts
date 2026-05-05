import { getQueryClient, getTRPCOptions } from "@/app/_layout/trpc/provider";
import type { RouterOutputs } from "@/server/api/trpc";

export const replaceReadingWithCustomDict = async (tokenizedSentence: RouterOutputs["morph"]["tokenizeSentence"]) => {
  const trpc = getTRPCOptions();
  const queryClient = getQueryClient();

  const { dictionaryDict } = await queryClient.ensureQueryData(
    trpc.morph.getCustomDict.queryOptions(undefined, {
      staleTime: Infinity,
      gcTime: Infinity,
    }),
  );

  let result = tokenizedSentence;

  for (const { surface, reading } of dictionaryDict) {
    const matchIndexes: number[] = [];

    for (const [index, lyric] of result.lyrics.entries()) {
      if (lyric === surface) {
        matchIndexes.push(index);
      }
    }

    if (matchIndexes.length > 0) {
      const newReadings = [...result.readings];
      for (const index of matchIndexes) {
        newReadings[index] = reading;
      }
      result = { ...result, readings: newReadings };
    }
  }

  console.log(result);

  return result;
};
