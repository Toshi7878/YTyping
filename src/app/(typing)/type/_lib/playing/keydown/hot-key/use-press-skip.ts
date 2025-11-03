import { readLineCount, readUtilityRefParams, readYTPlayer, writeUtilityRefParams } from "../../../atoms/read-atoms";
import { useReadPlaySpeed } from "../../../atoms/speed-reducer-atoms";
import {
  useReadGameUtilityParams,
  useReadMap,
  useReadUserTypingOptions,
  useSetActiveSkipGuideKey,
} from "../../../atoms/state-atoms";

export const usePressSkip = () => {
  const setActiveSkipGuideKey = useSetActiveSkipGuideKey();

  const readUserOptions = useReadUserTypingOptions();
  const readPlaySpeed = useReadPlaySpeed();
  const readMap = useReadMap();
  const readGameUtilityParams = useReadGameUtilityParams();

  return () => {
    const map = readMap();
    if (!map) return;
    const userOptions = readUserOptions();
    const { timeOffset, isRetrySkip } = readUtilityRefParams();
    const count = readLineCount();

    const startLine = map.mapData[map.startLine];
    const nextLine = map.mapData[count + 1];

    if (!startLine || !nextLine) return;

    const skippedTime =
      (isRetrySkip ? Number(startLine.time) : Number(nextLine.time)) + userOptions.timeOffset + timeOffset;

    const { playSpeed } = readPlaySpeed();
    const { movieDuration } = readGameUtilityParams();

    const seekTime = nextLine.lyrics === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    const YTPlayer = readYTPlayer();
    YTPlayer?.seekTo(seekTime, true);

    writeUtilityRefParams({ isRetrySkip: false });
    setActiveSkipGuideKey(null);
  };
};
