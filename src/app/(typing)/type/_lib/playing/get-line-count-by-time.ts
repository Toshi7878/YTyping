import { readBuiltMap } from "../atoms/state";

export const getLineCountByTime = (time: number): number => {
  const map = readBuiltMap();

  const nextIndex = map?.mapData.findIndex((line) => line.time >= time) ?? 0;
  return Math.max(0, nextIndex - 1);
};
