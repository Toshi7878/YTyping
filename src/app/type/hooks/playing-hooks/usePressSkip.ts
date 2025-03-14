import { useGameUtilsRef, usePlayer, useStatusRef, useYTStatusRef } from "../../atoms/refAtoms";
import {
  useMapState,
  usePlaySpeedStateRef,
  useSetSkipState,
  useUserTypingOptionsStateRef,
} from "../../atoms/stateAtoms";

export const usePressSkip = () => {
  const { readPlayer } = usePlayer();
  const map = useMapState();
  const setSkip = useSetSkipState();

  const { readGameUtils, writeGameUtils } = useGameUtilsRef();
  const { readYTStatusRef } = useYTStatusRef();
  const { readStatusRef } = useStatusRef();
  const readUserOptions = useUserTypingOptionsStateRef();
  const readPlaySpeed = usePlaySpeedStateRef();

  return () => {
    const userOptions = readUserOptions();
    const { timeOffset, isRetrySkip } = readGameUtils();
    const count = readStatusRef().count;

    const nextLine = map!.mapData[count];

    const skippedTime =
      (isRetrySkip ? Number(map!.mapData[map!.startLine]["time"]) : Number(nextLine["time"])) +
      userOptions.time_offset +
      timeOffset;

    const playSpeed = readPlaySpeed().playSpeed;

    const movieDuration = readYTStatusRef().movieDuration;
    const seekTime = nextLine["lyrics"] === "end" ? movieDuration - 2 : skippedTime - 1 + (1 - playSpeed);

    readPlayer().seekTo(seekTime, true);

    writeGameUtils({ isRetrySkip: false });
    setSkip("");
  };
};
