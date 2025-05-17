import { useReadMapState, useUserTypingOptionsStateRef } from "../../type/atoms/stateAtoms";
import { useGameUtilityReferenceParams, useLineCount, usePlayer, useYTStatus } from "../atom/refAtoms";
import { useReadPlaySpeed } from "../atom/speedReducerAtoms";

export const useGetTime = () => {
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useYTStatus();
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const readPlaySpeed = useReadPlaySpeed();
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readMap = useReadMapState();
  const { readCount } = useLineCount();

  const getCurrentOffsettedYTTime = () => {
    const { timeOffset } = readGameUtilRefParams();
    const typingOptions = readTypingOptions();
    const result = readPlayer().getCurrentTime() - typingOptions.time_offset - timeOffset;
    return result;
  };

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    return YTCurrentTime / readPlaySpeed().playSpeed;
  };

  const getCurrentLineTime = (YTCurrentTime: number) => {
    const map = readMap();
    const count = readCount();

    if (count - 1 < 0) {
      return YTCurrentTime;
    }

    const prevLine = map.mapData[count - 1];
    const lineTime = YTCurrentTime - Number(prevLine.time);
    return lineTime;
  };

  const getCurrentLineRemainTime = (YTCurrentTime: number) => {
    const map = readMap();
    const count = readCount();
    const nextLine = map.mapData[count];

    const movieDuration = readYTStatus().movieDuration;
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;

    const lineRemainTime = (nextLineTime - YTCurrentTime) / readPlaySpeed().playSpeed;

    return lineRemainTime;
  };

  const getConstantLineTime = (lineTime: number) => {
    const lineConstantTime = Math.floor((lineTime / readPlaySpeed().playSpeed) * 1000) / 1000;
    return lineConstantTime;
  };

  const getConstantRemainLineTime = (lineConstantTime: number) => {
    const map = readMap();
    const count = readCount();

    const nextLine = map.mapData[count];
    const currentLine = map.mapData[count - 1];
    const movieDuration = readYTStatus().movieDuration;
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
