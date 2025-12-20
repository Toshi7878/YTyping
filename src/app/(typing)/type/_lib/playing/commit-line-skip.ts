import { readTypingOptions } from "../atoms/hydrate";
import { readLineCount, readUtilityRefParams, writeUtilityRefParams } from "../atoms/ref";
import { readBuiltMap, readMediaSpeed, readUtilityParams, setActiveSkipGuideKey } from "../atoms/state";
import { seekYTPlayer } from "../atoms/youtube-player";

export const commitLineSkip = () => {
  const map = readBuiltMap();
  if (!map) return;
  const { timeOffset, isRetrySkip } = readUtilityRefParams();
  const count = readLineCount();

  const startLine = map.lines[map.typingLineIndexes[0] ?? 0];
  const nextLine = map.lines[count + 1];

  if (!startLine || !nextLine) return;

  const userOptions = readTypingOptions();
  const skippedTime =
    (isRetrySkip ? Number(startLine.time) : Number(nextLine.time)) + userOptions.timeOffset + timeOffset;

  const playSpeed = readMediaSpeed();
  const { movieDuration } = readUtilityParams();

  const seekTime = nextLine.lyrics === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

  seekYTPlayer(seekTime);

  writeUtilityRefParams({ isRetrySkip: false });
  setActiveSkipGuideKey(null);
};
