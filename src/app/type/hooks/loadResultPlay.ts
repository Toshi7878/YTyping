import { clientApi } from "@/trpc/client-api";
import { usePlayer } from "../atoms/refAtoms";

import { useSetIsLoadingOverlay, useSetLineResults, useSetPlayingInputMode, useSetScene } from "../atoms/stateAtoms";
import { LineResultData, PlayMode } from "../ts/type";

export const useLoadResultPlay = ({
  startMode,
  resultId,
}: {
  startMode: Exclude<PlayMode, "playing">;
  resultId: number | null;
}) => {
  const setIsLoadingOverlay = useSetIsLoadingOverlay();
  const setLineResults = useSetLineResults();
  const { readPlayer } = usePlayer();
  const setPlayingInputModeState = useSetPlayingInputMode();
  const utils = clientApi.useUtils();
  const setScene = useSetScene();

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
