import { useMapState } from "@/app/type/atoms/stateAtoms";

export const useGetSeekLineCount = () => {
  const map = useMapState();

  return (newTime: number): number => {
    const index = map.mapData.findIndex((line) => line.time >= newTime);
    return Math.max(index);
  };
};
