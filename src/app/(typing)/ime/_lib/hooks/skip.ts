import { useInputTextarea, usePlayer } from "../atoms/read-atoms";
import { useReadGameUtilParams, useReadMap, useSetSkipRemainTime } from "../atoms/state-atoms";

const SKIP_BUFFER_TIME = 3;

export const useSkip = () => {
  const setSkipRemainTime = useSetSkipRemainTime();
  const readMap = useReadMap();
  const { readGameUtilParams } = useReadGameUtilParams();
  const { readPlayer } = usePlayer();
  const { readInputTextarea } = useInputTextarea();

  return () => {
    const map = readMap();
    const { count } = readGameUtilParams();

    const nextLine = map.lines?.[count];

    const nextStartTime = Number(nextLine[0].time);

    const seekTime = nextStartTime - SKIP_BUFFER_TIME;

    readPlayer().seekTo(seekTime, true);

    setSkipRemainTime(null);
    readInputTextarea().focus();
  };
};
