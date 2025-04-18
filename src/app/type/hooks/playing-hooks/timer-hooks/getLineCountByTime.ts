import { useMapStateRef } from "@/app/type/atoms/stateAtoms";

export const useGetSeekLineCount = () => {
  const readMap = useMapStateRef();

  return (newTime: number): number => {
    const map = readMap();

    const index = map.mapData.findIndex((line) => line.time >= newTime);
    return Math.max(index);
  };
};
