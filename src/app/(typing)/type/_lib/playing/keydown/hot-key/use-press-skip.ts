import { readLineCount, readUtilityRefParams, readYTPlayer, writeUtilityRefParams } from "../../../atoms/read-atoms";
import { readPlaySpeed } from "../../../atoms/speed-reducer-atoms";
import { readBuiltMap, readTypingOptions, readUtilityParams, setActiveSkipGuideKey } from "../../../atoms/state-atoms";

export const usePressSkip = () => {
  return () => {
    const map = readBuiltMap();
    if (!map) return;
    const { timeOffset, isRetrySkip } = readUtilityRefParams();
    const count = readLineCount();

    const startLine = map.mapData[map.startLine];
    const nextLine = map.mapData[count + 1];

    if (!startLine || !nextLine) return;

    const userOptions = readTypingOptions();
    const skippedTime =
      (isRetrySkip ? Number(startLine.time) : Number(nextLine.time)) + userOptions.timeOffset + timeOffset;

    const { playSpeed } = readPlaySpeed();
    const { movieDuration } = readUtilityParams();

    const seekTime = nextLine.lyrics === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    const YTPlayer = readYTPlayer();
    YTPlayer?.seekTo(seekTime, true);

    writeUtilityRefParams({ isRetrySkip: false });
    setActiveSkipGuideKey(null);
  };
};
