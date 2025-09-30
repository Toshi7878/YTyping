import { useGameUtilityReferenceParams, useLineCount, usePlayer, useReadYTStatus } from "../../atoms/ref-atoms";
import { useReadPlaySpeed } from "../../atoms/speed-reducer-atoms";
import { useReadMap, useReadUserTypingOptions, useSetSkip } from "../../atoms/state-atoms";

export const usePressSkip = () => {
  const { readPlayer } = usePlayer();
  const setSkip = useSetSkip();

  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readYTStatus } = useReadYTStatus();
  const { readCount } = useLineCount();
  const readUserOptions = useReadUserTypingOptions();
  const readPlaySpeed = useReadPlaySpeed();
  const readMap = useReadMap();

  return () => {
    const map = readMap();
    if (!map) return;
    const userOptions = readUserOptions();
    const { timeOffset, isRetrySkip } = readGameUtilRefParams();
    const count = readCount();

    const nextLine = map.mapData[count];

    const skippedTime =
      (isRetrySkip ? Number(map.mapData[map.startLine].time) : Number(nextLine.time)) +
      userOptions.timeOffset +
      timeOffset;

    const { playSpeed } = readPlaySpeed();

    const { movieDuration } = readYTStatus();
    const seekTime = nextLine.lyrics === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    readPlayer().seekTo(seekTime, true);

    writeGameUtilRefParams({ isRetrySkip: false });
    setSkip("");
  };
};
