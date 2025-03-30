import { clientApi } from "@/trpc/client-api";
import { usePlayer } from "../atoms/refAtoms";

import {
  useSetIsLoadingOverlayState,
  useSetLineResultsState,
  useSetPlayingInputModeState,
  useSetSceneState,
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
  const setPlayingInputModeState = useSetPlayingInputModeState();
  const utils = clientApi.useUtils();
  const setScene = useSetSceneState();

  const loadResultPlay = async () => {
    try {
      if (resultId) {
        setIsLoadingOverlay(true);
        const resultData: LineResultData[] = await utils.result.getUserResultData.ensureData({ resultId });
        if (startMode === "replay") {
          setPlayingInputModeState(resultData[0].status.mode);
        }
        setLineResults(resultData);
      }
    } finally {
      setIsLoadingOverlay(false);
      readPlayer().playVideo();
      setScene(startMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return loadResultPlay;
};
