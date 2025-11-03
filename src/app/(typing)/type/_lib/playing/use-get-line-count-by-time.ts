import { readBuiltMap } from "../atoms/state-atoms";

export const useGetLineCountByTime = () => {
  return (time: number): number => {
    const map = readBuiltMap();

    const nextIndex = map?.mapData.findIndex((line) => line.time >= time) ?? 0;
    return Math.max(0, nextIndex - 1);
  };
};
