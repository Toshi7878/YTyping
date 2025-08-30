import { useQueryClient } from "@tanstack/react-query";
import { usePlayer } from "../atoms/refAtoms";

import { useLoadingOverlay } from "@/lib/globalAtoms";
import { useResultQueries } from "@/utils/queries/result.queries";
import { useSetLineResults, useSetPlayingInputMode, useSetScene } from "../atoms/stateAtoms";
import { PlayMode } from "../type";

export const useResultPlay = ({ startMode }: { startMode: Exclude<PlayMode, "playing"> }) => {
  const setLineResults = useSetLineResults();
  const { readPlayer } = usePlayer();
  const setPlayingInputModeState = useSetPlayingInputMode();
  const setScene = useSetScene();
  const { showLoading, hideLoading } = useLoadingOverlay();
  const queryClient = useQueryClient();
  const resultQueries = useResultQueries();

  return async (resultId: number | null) => {
    try {
      if (resultId) {
        showLoading({ message: "リザルトデータを読込中..." });
        const resultData = await queryClient.ensureQueryData(resultQueries.result({ resultId }));

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
  };
};
