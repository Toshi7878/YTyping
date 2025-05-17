import { RouterOutPuts } from "@/server/api/trpc";
import { useFetchCustomDic } from "./fetch/fetchCustomDic";

export const useReplaceReadingWithCustomDic = () => {
  const fetchCustomDic = useFetchCustomDic();

  return async (sentense: RouterOutPuts["morphConvert"]["tokenizeWordAws"]) => {
    const { customDic } = await fetchCustomDic();
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
