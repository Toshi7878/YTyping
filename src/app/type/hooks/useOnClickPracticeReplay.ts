import { clientApi } from "@/trpc/client-api";
import { useGameUtilsRef, usePlayer } from "../atoms/refAtoms";

import { useSetIsLoadingOverlayState, useSetLineResultsState } from "../atoms/stateAtoms";
import { PlayMode } from "../ts/type";

export const useOnClickPracticeReplay = ({
  startMode,
  resultId,
}: {
  startMode: Exclude<PlayMode, "playing">;
  resultId: number | null;
}) => {
  const setIsLoadingOverlay = useSetIsLoadingOverlayState();
  const setLineResults = useSetLineResultsState();
  const { readPlayer } = usePlayer();
  const { writeGameUtils } = useGameUtilsRef();
  const utils = clientApi.useUtils();

  const handleClick = async () => {
    try {
      if (resultId) {
        setIsLoadingOverlay(true);
        const resultData = await utils.result.getUserResultData.ensureData({ resultId });
        setLineResults(resultData);
      }
    } finally {
      setIsLoadingOverlay(false);
      readPlayer().playVideo();
      writeGameUtils({
        playMode: startMode,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return handleClick;
};
