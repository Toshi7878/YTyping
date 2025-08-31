import { useReadMap } from "@/app/(typing)/type/_lib/atoms/stateAtoms";

export const useGetSeekLineCount = () => {
  const readMap = useReadMap();

  return (newTime: number): number => {
    const map = readMap();

    const index = map.mapData.findIndex((line) => line.time >= newTime);
    return Math.max(index);
  };
};
