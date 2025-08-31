import { useGameUtilityReferenceParams, useLineCount, usePlayer, useYTStatus } from "../../atoms/refAtoms";
import { usePlaySpeedStateRef } from "../../atoms/speedReducerAtoms";
import { useReadMap, useSetSkip, useUserTypingOptionsStateRef } from "../../atoms/stateAtoms";

export const usePressSkip = () => {
  const { readPlayer } = usePlayer();
  const setSkip = useSetSkip();

  const { readGameUtilRefParams, writeGameUtilRefParams } = useGameUtilityReferenceParams();
  const { readYTStatus } = useYTStatus();
  const { readCount } = useLineCount();
  const readUserOptions = useUserTypingOptionsStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readMap = useReadMap();

  return () => {
    const map = readMap();
    const userOptions = readUserOptions();
    const { timeOffset, isRetrySkip } = readGameUtilRefParams();
    const count = readCount();

    const nextLine = map.mapData[count];

    const skippedTime =
      (isRetrySkip ? Number(map.mapData[map.startLine]["time"]) : Number(nextLine["time"])) +
      userOptions.time_offset +
      timeOffset;

    const { playSpeed } = readPlaySpeed();

    const { movieDuration } = readYTStatus();
    const seekTime = nextLine["lyrics"] === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    readPlayer().seekTo(seekTime, true);

    writeGameUtilRefParams({ isRetrySkip: false });
    setSkip("");
  };
};
