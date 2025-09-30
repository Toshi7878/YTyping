import { useGameUtilityReferenceParams, useLineCount, usePlayer, useReadYTStatus } from "../../atoms/ref-atoms";
import { useReadPlaySpeed } from "../../atoms/speed-reducer-atoms";
import { useReadMap, useReadUserTypingOptions } from "../../atoms/state-atoms";

export const useGetTime = () => {
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useReadYTStatus();
  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const readPlaySpeed = useReadPlaySpeed();
  const readTypingOptions = useReadUserTypingOptions();
  const readMap = useReadMap();
  const { readCount } = useLineCount();

  const getCurrentOffsettedYTTime = () => {
    const { timeOffset } = readGameUtilRefParams();
    const { movieDuration } = readYTStatus();
    const typingOptions = readTypingOptions();
    const result = readPlayer().getCurrentTime() - typingOptions.timeOffset - timeOffset;
    return Number.isNaN(result) ? movieDuration : result;
  };

  const getConstantOffsettedYTTime = (YTCurrentTime: number) => {
    return YTCurrentTime / readPlaySpeed().playSpeed;
  };

  const getCurrentLineTime = (YTCurrentTime: number) => {
    const map = readMap();
    if (!map) return 0;
    const count = readCount();

    if (count - 1 < 0) {
      return YTCurrentTime;
    }

    const prevLine = map.mapData[count - 1];
    return YTCurrentTime - Number(prevLine.time);
  };

  const getCurrentLineRemainTime = (YTCurrentTime: number) => {
    const map = readMap();
    if (!map) return 0;

    const count = readCount();
    const nextLine = map.mapData[count];

    const { movieDuration } = readYTStatus();
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
    if (!map) return 0;
    const count = readCount();

    const nextLine = map.mapData[count];
    const currentLine = map.mapData[count - 1];
    const { movieDuration } = readYTStatus();
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
