import { getBuiltMap } from "../../atoms/state";

export const getLineCountByTime = (time: number): number => {
  const map = getBuiltMap();

  const nextIndex = map?.lines.findIndex((line) => line.time >= time) ?? 0;
  return Math.max(0, nextIndex - 1);
};
