import { useGameUtilityReferenceParams, useLineCount, usePlayer } from "../../../atoms/read-atoms";
import { useReadPlaySpeed } from "../../../atoms/speed-reducer-atoms";
import {
  useReadGameUtilityParams,
  useReadMap,
  useReadUserTypingOptions,
  useSetActiveSkipGuideKey,
} from "../../../atoms/state-atoms";

export const usePressSkip = () => {
  const { readPlayer } = usePlayer();
  const setActiveSkipGuideKey = useSetActiveSkipGuideKey();

  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readCount } = useLineCount();
  const readUserOptions = useReadUserTypingOptions();
  const readPlaySpeed = useReadPlaySpeed();
  const readMap = useReadMap();
  const readGameUtilityParams = useReadGameUtilityParams();

  return () => {
    const map = readMap();
    if (!map) return;
    const userOptions = readUserOptions();
    const { timeOffset, isRetrySkip } = readGameUtilRefParams();
    const count = readCount();

    const nextLine = map.mapData[count + 1];

    const skippedTime =
      (isRetrySkip ? Number(map.mapData[map.startLine].time) : Number(nextLine.time)) +
      userOptions.timeOffset +
      timeOffset;

    const { playSpeed } = readPlaySpeed();
    const { movieDuration } = readGameUtilityParams();

    const seekTime = nextLine.lyrics === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    readPlayer().seekTo(seekTime, true);

    writeGameUtilRefParams({ isRetrySkip: false });
    setActiveSkipGuideKey(null);
  };
};
