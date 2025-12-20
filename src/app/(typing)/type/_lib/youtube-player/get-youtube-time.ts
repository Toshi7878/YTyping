import { readTypingOptions } from "../atoms/hydrate";
import { readLineCount, readUtilityRefParams } from "../atoms/ref";
import { readBuiltMap, readMediaSpeed, readUtilityParams } from "../atoms/state";
import { getYTCurrentTime } from "../atoms/youtube-player";

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
  const constantRemainLineTime = getConstantRemainLineTime({ constantLineTime });

  return {
    currentTime,
    constantTime,
    currentLineTime,
    constantLineTime,
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
  const playSpeed = readMediaSpeed();
  return currentTime / playSpeed;
};

const getCurrentLineTime = ({ currentTime }: { currentTime: number }) => {
  const map = readBuiltMap();
  if (!map) return 0;
  const count = readLineCount();

  const currentLine = map.lines[count];
  return currentTime - Number(currentLine?.time);
};

const getConstantLineTime = ({ currentLineTime }: { currentLineTime: number }) => {
  const playSpeed = readMediaSpeed();

  const lineConstantTime = Math.floor((currentLineTime / playSpeed) * 1000) / 1000;
  return lineConstantTime;
};

const getConstantRemainLineTime = ({ constantLineTime }: { constantLineTime: number }) => {
  const map = readBuiltMap();
  if (!map) return 0;

  const count = readLineCount();
  const currentLine = map.lines[count];
  if (!currentLine) return 0;

  const playSpeed = readMediaSpeed();

  const constantLineDuration = currentLine.duration / playSpeed;
  return constantLineDuration - constantLineTime;
};
