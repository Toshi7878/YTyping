import { usePlayer, useStatusRef, useYTStatusRef } from "../atoms/refAtoms";
import {
  useMapAtom,
  usePlaySpeedAtom,
  useTimeOffsetAtom,
  useUserTypingOptionsAtom,
} from "../atoms/stateAtoms";

export const useGetTime = () => {
  const map = useMapAtom();
  const userOptions = useUserTypingOptionsAtom();
  const timeOffset = useTimeOffsetAtom();
  const speed = usePlaySpeedAtom();

  const { readPlayer } = usePlayer();
  const { readYTStatusRef } = useYTStatusRef();
  const { readStatusRef } = useStatusRef();
  const getCurrentOffsettedYTTime = () => {
    const result = readPlayer().getCurrentTime() - userOptions.time_offset - timeOffset;
    return result;
  };

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    return YTCurrentTime / speed.playSpeed;
  };

  const getCurrentLineTime = (YTCurrentTime: number) => {
    const count = readStatusRef().count;

    if (count - 1 < 0) {
      return YTCurrentTime;
    }

    const prevLine = map!.mapData[count - 1];
    const lineTime = YTCurrentTime - Number(prevLine.time);
    return lineTime;
  };

  const getCurrentLineRemainTime = (YTCurrentTime: number) => {
    const count = readStatusRef().count;
    const nextLine = map!.mapData[count];

    const movieDuration = readYTStatusRef().movieDuration;
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;

    const lineRemainTime = (nextLineTime - YTCurrentTime) / speed.playSpeed;

    return lineRemainTime;
  };

  const getConstantLineTime = (lineTime: number) => {
    const lineConstantTime = Math.round((lineTime / speed.playSpeed) * 1000) / 1000;
    return lineConstantTime;
  };

  const getConstantRemainLineTime = (lineConstantTime: number) => {
    const count = readStatusRef().count;

    const nextLine = map!.mapData[count];
    const currentLine = map!.mapData[count - 1];
    const movieDuration = readYTStatusRef().movieDuration;
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
