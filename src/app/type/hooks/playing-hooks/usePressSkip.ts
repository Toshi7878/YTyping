import { useCountRef, useGameUtilsRef, usePlayer, useYTStatusRef } from "../../atoms/refAtoms";
import { usePlaySpeedStateRef } from "../../atoms/speedReducerAtoms";
import { useMapStateRef, useSetSkipState, useUserTypingOptionsStateRef } from "../../atoms/stateAtoms";

export const usePressSkip = () => {
  const { readPlayer } = usePlayer();
  const setSkip = useSetSkipState();

  const { readGameUtils, writeGameUtils } = useGameUtilsRef();
  const { readYTStatus } = useYTStatusRef();
  const { readCount } = useCountRef();
  const readUserOptions = useUserTypingOptionsStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();
  const readMap = useMapStateRef();

  return () => {
    const map = readMap();
    const userOptions = readUserOptions();
    const { timeOffset, isRetrySkip } = readGameUtils();
    const count = readCount();

    const nextLine = map.mapData[count];

    const skippedTime =
      (isRetrySkip ? Number(map.mapData[map!.startLine]["time"]) : Number(nextLine["time"])) +
      userOptions.time_offset +
      timeOffset;

    const playSpeed = readPlaySpeed().playSpeed;

    const movieDuration = readYTStatus().movieDuration;
    const seekTime = nextLine["lyrics"] === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    readPlayer().seekTo(seekTime, true);

    writeGameUtils({ isRetrySkip: false });
    setSkip("");
  };
};
