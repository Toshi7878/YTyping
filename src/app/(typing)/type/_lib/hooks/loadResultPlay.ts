import { useQueryClient } from "@tanstack/react-query";
import { usePlayer } from "../atoms/refAtoms";

import { useLoadingOverlay } from "@/lib/globalAtoms";
import { useResultQueries } from "@/utils/queries/result.queries";
import { useSetLineResults, useSetPlayingInputMode, useSetScene } from "../atoms/stateAtoms";
import { LineResultData, PlayMode } from "../type";

export const useLoadResultPlay = ({
  startMode,
  resultId,
}: {
  startMode: Exclude<PlayMode, "playing">;
  resultId: number | null;
}) => {
  const setLineResults = useSetLineResults();
  const { readPlayer } = usePlayer();
  const setPlayingInputModeState = useSetPlayingInputMode();
  const setScene = useSetScene();
  const queryClient = useQueryClient();
  const resultQueries = useResultQueries();
  const { showLoading, hideLoading } = useLoadingOverlay();

  const loadResultPlay = async () => {
    try {
      if (resultId) {
        showLoading({ message: "リザルトデータを読込中..." });
        const resultData: LineResultData[] = await queryClient.ensureQueryData(resultQueries.result({ resultId }));
        if (startMode === "replay") {
          setPlayingInputModeState(resultData[0].status.mode);
        }
        setLineResults(resultData);
      }
    } finally {
      hideLoading();
      readPlayer().playVideo();
      setScene(startMode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return loadResultPlay;
};
