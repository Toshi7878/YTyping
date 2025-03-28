import { clientApi } from "@/trpc/client-api";
import { useGameUtilsRef, usePlayer } from "../atoms/refAtoms";

import {
  useSetIsLoadingOverlayState,
  useSetLineResultsState,
  useSetPlayingInputModeState,
} from "../atoms/stateAtoms";
import { LineResultData, PlayMode } from "../ts/type";

export const useLoadResultPlay = ({
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
  const setPlayingInputModeState = useSetPlayingInputModeState();
  const utils = clientApi.useUtils();

  const loadResultPlay = async () => {
    try {
      if (resultId) {
        setIsLoadingOverlay(true);
        const resultData: LineResultData[] = await utils.result.getUserResultData.ensureData({ resultId });
        setLineResults(resultData);
        setPlayingInputModeState(resultData[0].status.mode);
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

  return loadResultPlay;
};
