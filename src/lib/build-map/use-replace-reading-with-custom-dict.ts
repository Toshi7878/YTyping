import type { RouterOutPuts } from "@/server/api/trpc";
import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";

export const replaceReadingWithCustomDict = async (
  tokenizedSentence: RouterOutPuts["morphConvert"]["tokenizeSentence"],
) => {
  const queryClient = getQueryClient();
  const trpcOptions = getTRPCOptionsProxy();

  const { dictionaryDict } = await queryClient.ensureQueryData(
    trpcOptions.morphConvert.getCustomDict.queryOptions(undefined, {
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
