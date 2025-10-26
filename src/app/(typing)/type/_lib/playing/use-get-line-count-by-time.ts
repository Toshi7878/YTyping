import { useReadMap } from "@/app/(typing)/type/_lib/atoms/state-atoms";

export const useGetLineCountByTime = () => {
  const readMap = useReadMap();

  return (time: number): number => {
    const map = readMap();

    const nextIndex = map?.mapData.findIndex((line) => line.time >= time) ?? 0;
    return Math.max(0, nextIndex - 1);
  };
};
