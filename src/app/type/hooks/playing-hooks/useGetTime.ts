import { useCountRef, useGameUtilsRef, usePlayer, useYTStatusRef } from "../../atoms/refAtoms";
import { usePlaySpeedStateRef } from "../../atoms/speedReducerAtoms";
import { useMapStateRef, useUserTypingOptionsStateRef } from "../../atoms/stateAtoms";

export const useGetTime = () => {
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useYTStatusRef();
  const { readGameUtils } = useGameUtilsRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readTypingOptions = useUserTypingOptionsStateRef();
  const readMap = useMapStateRef();
  const { readCount } = useCountRef();

  const getCurrentOffsettedYTTime = () => {
    const { timeOffset } = readGameUtils();
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
    const lineConstantTime = Math.round((lineTime / readPlaySpeed().playSpeed) * 1000) / 1000;
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
