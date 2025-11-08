import { readTypingOptions } from "../atoms/hydrate";
import { readLineCount, readUtilityRefParams, writeUtilityRefParams } from "../atoms/ref";
import { readPlaySpeed } from "../atoms/speed-reducer";
import { readBuiltMap, readUtilityParams, setActiveSkipGuideKey } from "../atoms/state";
import { seekYTPlayer } from "../atoms/yt-player";

export const commitLineSkip = () => {
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

  seekYTPlayer(seekTime);

  writeUtilityRefParams({ isRetrySkip: false });
  setActiveSkipGuideKey(null);
};
