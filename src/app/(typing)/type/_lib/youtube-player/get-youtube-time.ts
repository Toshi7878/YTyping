import { readTypingOptions } from "../atoms/hydrate";
import { readLineCount, readUtilityRefParams } from "../atoms/ref";
import { readPlaySpeed } from "../atoms/speed-reducer";
import { readBuiltMap, readUtilityParams } from "../atoms/state";
import { getYTCurrentTime } from "../atoms/yt-player";

export const getTime = () => {
  const currentTime = getCurrentOffsettedYTTime();
  const constantTime = getConstantOffsettedYTTime({ currentTime });

  return { currentTime, constantTime };
};

export const getLineTime = () => {
  const currentTime = getCurrentOffsettedYTTime();
  const constantTime = getConstantOffsettedYTTime({ currentTime });
  const currentLineTime = getCurrentLineTime({ currentTime });
  const constantLineTime = getConstantLineTime({ currentLineTime });

  return { currentTime, constantTime, currentLineTime, constantLineTime };
};

export const getRemainLineTime = () => {
  const currentTime = getCurrentOffsettedYTTime();
  const constantTime = getConstantOffsettedYTTime({ currentTime });
  const currentLineTime = getCurrentLineTime({ currentTime });
  const constantLineTime = getConstantLineTime({ currentLineTime });
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
};

const getCurrentOffsettedYTTime = () => {
  const { timeOffset } = readUtilityRefParams();
  const { movieDuration } = readUtilityParams();
  const typingOptions = readTypingOptions();
  const YTCurrentTime = getYTCurrentTime();
  if (!YTCurrentTime) return 0;

  const result = YTCurrentTime - typingOptions.timeOffset - timeOffset;
  return Number.isNaN(result) ? movieDuration : result;
};

const getConstantOffsettedYTTime = ({ currentTime }: { currentTime: number }) => {
  return currentTime / readPlaySpeed().playSpeed;
};

const getCurrentLineTime = ({ currentTime }: { currentTime: number }) => {
  const map = readBuiltMap();
  if (!map) return 0;
  const count = readLineCount();

  const currentLine = map.lines[count];
  return currentTime - Number(currentLine?.time);
};

const getCurrentLineRemainTime = ({ currentTime }: { currentTime: number }) => {
  const map = readBuiltMap();
  const count = readLineCount();
  const nextLine = map?.lines[count + 1];
  if (!nextLine) return 0;

  const { movieDuration } = readUtilityParams();
  const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;

  const lineRemainTime = (nextLineTime - currentTime) / readPlaySpeed().playSpeed;

  return lineRemainTime;
};

const getConstantLineTime = ({ currentLineTime }: { currentLineTime: number }) => {
  const lineConstantTime = Math.floor((currentLineTime / readPlaySpeed().playSpeed) * 1000) / 1000;
  return lineConstantTime;
};

const getConstantRemainLineTime = ({ constantLineTime }: { constantLineTime: number }) => {
  const map = readBuiltMap();
  const count = readLineCount();
  const nextLine = map?.lines[count + 1];
  if (!nextLine) return 0;

  const currentLine = map.lines[count];
  if (!currentLine) return 0;

  const { movieDuration } = readUtilityParams();
  const nextLineTime = nextLine.time > movieDuration ? movieDuration : nextLine.time;
  return (nextLineTime - currentLine.time) / readPlaySpeed().playSpeed - constantLineTime;
};
