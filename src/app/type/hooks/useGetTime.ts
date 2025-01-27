import {
  useMapAtom,
  useTimeOffsetAtom,
  useTypePageSpeedAtom,
  useUserOptionsAtom,
} from "../type-atoms/gameRenderAtoms";
import { useRefs } from "../type-contexts/refsProvider";

export const useGetTime = () => {
  const map = useMapAtom();
  const userOptions = useUserOptionsAtom();
  const timeOffset = useTimeOffsetAtom();
  const speed = useTypePageSpeedAtom();
  const { playerRef, statusRef, ytStateRef } = useRefs();

  const getCurrentOffsettedYTTime = () => {
    const result = playerRef.current!.getCurrentTime() - userOptions.time_offset - timeOffset;
    return result;
  };

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    return YTCurrentTime / speed.playSpeed;
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

    const lineRemainTime = (nextLineTime - YTCurrentTime) / speed.playSpeed;

    return lineRemainTime;
  };

  const getConstantLineTime = (lineTime: number) => {
    const lineConstantTime = Math.round((lineTime / speed.playSpeed) * 1000) / 1000;
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
