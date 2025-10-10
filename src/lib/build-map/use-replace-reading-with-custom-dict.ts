import { useQueryClient } from "@tanstack/react-query";
import type { RouterOutPuts } from "@/server/api/trpc";
import { useMorphQueries } from "../queries/morph.queries";

export const useReplaceReadingWithCustomDict = () => {
  const queryClient = useQueryClient();
  const morphQueries = useMorphQueries();

  return async (sentense: RouterOutPuts["morphConvert"]["tokenizeWordAws"]) => {
    const { dictionaryDict } = await queryClient.ensureQueryData(morphQueries.customDic());
    let result = sentense;

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
};
