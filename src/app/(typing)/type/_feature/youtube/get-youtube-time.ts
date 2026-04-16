import { getBuiltMap } from "../atoms/built-map";
import { getYTCurrentTime } from "../atoms/youtube-player";
import { getTypingOptions } from "../tabs/setting/popover";
import { getLineCount, getTimeOffset } from "../typing-card/playing/playing-scene";
import { getMediaSpeed } from "./youtube-player";

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
  const timeOffset = getTimeOffset();
  const map = getBuiltMap();
  if (!map) return 0;
  const typingOptions = getTypingOptions();
  const YTCurrentTime = getYTCurrentTime();
  if (!YTCurrentTime) return 0;

  const result = YTCurrentTime - typingOptions.timeOffset - timeOffset;
  return Number.isNaN(result) ? map.duration : result;
};

const getConstantOffsettedYTTime = ({ currentTime }: { currentTime: number }) => {
  const playSpeed = getMediaSpeed();
  return currentTime / playSpeed;
};

const getCurrentLineTime = ({ currentTime }: { currentTime: number }) => {
  const map = getBuiltMap();
  if (!map) return 0;
  const count = getLineCount();

  const currentLine = map.lines[count];
  return currentTime - Number(currentLine?.time);
};

const getConstantLineTime = ({ currentLineTime }: { currentLineTime: number }) => {
  const playSpeed = getMediaSpeed();

  const lineConstantTime = Math.floor((currentLineTime / playSpeed) * 1000) / 1000;
  return lineConstantTime;
};

const getConstantRemainLineTime = ({ constantLineTime }: { constantLineTime: number }) => {
  const map = getBuiltMap();
  if (!map) return 0;

  const count = getLineCount();
  const currentLine = map.lines[count];
  if (!currentLine) return 0;

  const playSpeed = getMediaSpeed();

  const constantLineDuration = currentLine.duration / playSpeed;
  return constantLineDuration - constantLineTime;
};
