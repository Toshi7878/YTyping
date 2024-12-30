import { useStore } from "jotai";
import {
  speedAtom,
  timeOffsetAtom,
  useMapAtom,
  userOptionsAtom,
} from "../type-atoms/gameRenderAtoms";
import { useRefs } from "../type-contexts/refsProvider";

export const useGetTime = () => {
  const map = useMapAtom();
  const { playerRef, statusRef, ytStateRef } = useRefs();
  const typeAtomStore = useStore();

  const getCurrentOffsettedYTTime = () => {
    const userOptions = typeAtomStore.get(userOptionsAtom);
    const timeOffset = typeAtomStore.get(timeOffsetAtom);

    const result = playerRef.current!.getCurrentTime() - userOptions.timeOffset - timeOffset;
    return result;
  };

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    return YTCurrentTime / playSpeed;
  };

  const getCurrentLineTime = (YTCurrentTime: number) => {
    const count = statusRef.current!.status.count;

    if (count - 1 < 0) {
      return YTCurrentTime;
    }

    const prevLine = map!.mapData[count - 1];
    const lineTime = YTCurrentTime - Number(prevLine.time);
    return lineTime;
  };

  const getCurrentLineRemainTime = (YTCurrentTime: number) => {
    const count = statusRef.current!.status.count;
    const nextLine = map!.mapData[count];
    const movieDuration = ytStateRef.current!.movieDuration;
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const lineRemainTime = (nextLineTime - YTCurrentTime) / playSpeed;

    return lineRemainTime;
  };

  const getConstantLineTime = (lineTime: number) => {
    const playSpeed = typeAtomStore.get(speedAtom).playSpeed;

    const lineConstantTime = Math.round((lineTime / playSpeed) * 1000) / 1000;
    return lineConstantTime;
  };

  const getConstantRemainLineTime = (lineConstantTime: number) => {
    const count = statusRef.current!.status.count;

    const nextLine = map!.mapData[count];
    const currentLine = map!.mapData[count - 1];
    const movieDuration = ytStateRef.current!.movieDuration;
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;

    const lineRemainConstantTime = nextLineTime - currentLine.time - lineConstantTime;
    return lineRemainConstantTime;
  };

  return {
    getCurrentOffsettedYTTime,
    getConstantOffsettedYTTime,
    getCurrentLineTime,
    getConstantLineTime,
    getConstantRemainLineTime,
    getCurrentLineRemainTime,
  };
};
