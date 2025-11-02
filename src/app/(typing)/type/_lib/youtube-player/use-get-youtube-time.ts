import { useGameUtilityReferenceParams, useLineCount, usePlayer } from "../atoms/read-atoms";
import { useReadPlaySpeed } from "../atoms/speed-reducer-atoms";
import { useReadGameUtilityParams, useReadMap, useReadUserTypingOptions } from "../atoms/state-atoms";

type GetTimeKey = { type: "time" } | { type: "lineTime" } | { type: "remainLineTime" };
type CurrentTimeResult = {
  currentTime: number;
  constantTime: number;
};

type CurrentLineTimeResult = CurrentTimeResult & {
  currentLineTime: number;
  constantLineTime: number;
};

type CurrentRemainLineTimeResult = CurrentLineTimeResult & {
  currentRemainLineTime: number;
  constantRemainLineTime: number;
};

type TimeResultMap = {
  time: CurrentTimeResult;
  lineTime: CurrentLineTimeResult;
  remainLineTime: CurrentRemainLineTimeResult;
};

export const useGetYouTubeTime = () => {
  const { readPlayer } = usePlayer();
  const readGameUtilityParams = useReadGameUtilityParams();

  const { readGameUtilRefParams } = useGameUtilityReferenceParams();
  const readPlaySpeed = useReadPlaySpeed();
  const readTypingOptions = useReadUserTypingOptions();
  const readMap = useReadMap();
  const { readCount } = useLineCount();

  const getCurrentOffsettedYTTime = () => {
    const { timeOffset } = readGameUtilRefParams();
    const { movieDuration } = readGameUtilityParams();
    const typingOptions = readTypingOptions();
    const result = readPlayer().getCurrentTime() - typingOptions.timeOffset - timeOffset;
    return Number.isNaN(result) ? movieDuration : result;
  };

  const getConstantOffsettedYTTime = ({ currentTime }: { currentTime: number }) => {
    return currentTime / readPlaySpeed().playSpeed;
  };

  const getCurrentLineTime = ({ currentTime }: { currentTime: number }) => {
    const map = readMap();
    if (!map) return 0;
    const count = readCount();

    const currentLine = map.mapData[count];
    return currentTime - Number(currentLine?.time);
  };

  const getCurrentLineRemainTime = ({ currentTime }: { currentTime: number }) => {
    const map = readMap();
    const count = readCount();
    const nextLine = map?.mapData[count + 1];
    if (!nextLine) return 0;

    const { movieDuration } = readGameUtilityParams();
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;

    const lineRemainTime = (nextLineTime - currentTime) / readPlaySpeed().playSpeed;

    return lineRemainTime;
  };

  const getConstantLineTime = ({ currentLineTime }: { currentLineTime: number }) => {
    const lineConstantTime = Math.floor((currentLineTime / readPlaySpeed().playSpeed) * 1000) / 1000;
    return lineConstantTime;
  };

  const getConstantRemainLineTime = ({ constantLineTime }: { constantLineTime: number }) => {
    const map = readMap();
    const count = readCount();
    const nextLine = map?.mapData[count + 1];
    if (!nextLine) return 0;

    const currentLine = map.mapData[count];
    if (!currentLine) return 0;

    const { movieDuration } = readGameUtilityParams();
    const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
    return (nextLineTime - currentLine.time) / readPlaySpeed().playSpeed - constantLineTime;
  };

  function getTimes(arg: { type: "time" }): TimeResultMap["time"];
  function getTimes(arg: { type: "lineTime" }): TimeResultMap["lineTime"];
  function getTimes(arg: { type: "remainLineTime" }): TimeResultMap["remainLineTime"];
  function getTimes({ type }: GetTimeKey) {
    const currentTime = getCurrentOffsettedYTTime();
    const constantTime = getConstantOffsettedYTTime({ currentTime });

    if (type === "time") {
      return { currentTime, constantTime };
    }

    const currentLineTime = getCurrentLineTime({ currentTime });
    const constantLineTime = getConstantLineTime({ currentLineTime });

    if (type === "lineTime") {
      return { currentTime, constantTime, currentLineTime, constantLineTime };
    }

    const currentRemainLineTime = getCurrentLineRemainTime({ currentTime });
    const constantRemainLineTime = getConstantRemainLineTime({ constantLineTime });

    return {
      currentTime,
      constantTime,
      currentLineTime,
      constantLineTime,
      currentRemainLineTime,
      constantRemainLineTime,
    };
  }

  return getTimes;
};
