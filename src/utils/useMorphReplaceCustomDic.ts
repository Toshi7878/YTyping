import { RouterOutPuts } from "@/server/api/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { useMorphQueries } from "./queries/morph.queries";

export const useReplaceReadingWithCustomDic = () => {
  const queryClient = useQueryClient();
  const morphQueries = useMorphQueries();

  return async (sentense: RouterOutPuts["morphConvert"]["tokenizeWordAws"]) => {
    const { customDic } = await queryClient.ensureQueryData(morphQueries.customDic());
    const result = customDic.reduce((acc, { surface, reading }) => {
      const matchIndexes: number[] = [];
      acc.lyrics.forEach((lyric, index) => {
        if (lyric === surface) {
          matchIndexes.push(index);
        }
      });

      if (matchIndexes.length > 0) {
        const newReadings = [...acc.readings];
        matchIndexes.forEach((index) => {
          newReadings[index] = reading;
        });
        return { ...acc, readings: newReadings };
      }

      return acc;
    }, sentense);

    console.log(result);

    return result;
  };
};
