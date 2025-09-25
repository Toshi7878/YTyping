import { useReadMap } from "@/app/(typing)/type/_lib/atoms/state-atoms";

export const useGetSeekLineCount = () => {
  const readMap = useReadMap();

  return (newTime: number): number => {
    const map = readMap();

    const index = map?.mapData.findIndex((line) => line.time >= newTime) ?? 0;
    return Math.max(index);
  };
};
