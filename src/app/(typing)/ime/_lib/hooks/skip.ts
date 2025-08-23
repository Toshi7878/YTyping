import { useInputTextarea, usePlayer } from "../atoms/refAtoms";
import { useReadPlaySpeed } from "../atoms/speedReducerAtoms";
import { useReadGameUtilParams, useReadMap, useSetSkipRemainTime } from "../atoms/stateAtoms";

const SKIP_BUFFER_TIME = 3;

export const useSkip = () => {
  const setSkipRemainTime = useSetSkipRemainTime();
  const readMap = useReadMap();
  const { readGameUtilParams } = useReadGameUtilParams();
  const readPlaySpeed = useReadPlaySpeed();
  const { readPlayer } = usePlayer();
  const { readInputTextarea } = useInputTextarea();

  return () => {
    const map = readMap();
    const { count } = readGameUtilParams();

    const nextLine = map.lines?.[count];

    const nextStartTime = Number(nextLine[0]["time"]);

    const { playSpeed } = readPlaySpeed();

    const seekTime = nextStartTime - SKIP_BUFFER_TIME + (SKIP_BUFFER_TIME - playSpeed);

    readPlayer().seekTo(seekTime, true);

    setSkipRemainTime(null);
    readInputTextarea().focus();
  };
};
