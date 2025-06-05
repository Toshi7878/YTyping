import { useQueryClient } from "@tanstack/react-query";
import { usePlayer } from "../atoms/refAtoms";

import { useResultQueries } from "@/utils/queries/result.queries";
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
  const setScene = useSetScene();
  const queryClient = useQueryClient();
  const resultQueries = useResultQueries();

  const loadResultPlay = async () => {
    try {
      if (resultId) {
        setIsLoadingOverlay(true);
        const resultData: LineResultData[] = await queryClient.ensureQueryData(resultQueries.result({ resultId }));
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
