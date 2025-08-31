import { useQueryClient } from "@tanstack/react-query";
import { usePlayer } from "../atoms/refAtoms";

import { useGlobalLoadingOverlay } from "@/lib/globalAtoms";
import { useResultQueries } from "@/utils/queries/result.queries";
import { useInitializeLineResults, useSetPlayingInputMode, useSetScene } from "../atoms/stateAtoms";
import { PlayMode } from "../type";

export const useResultPlay = ({ startMode }: { startMode: Exclude<PlayMode, "playing"> }) => {
  const initializeLineResults = useInitializeLineResults();
  const { readPlayer } = usePlayer();
  const setPlayingInputModeState = useSetPlayingInputMode();
  const setScene = useSetScene();
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();
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
        initializeLineResults(resultData);
      }
    } finally {
      hideLoading();
      readPlayer().playVideo();
      setScene(startMode);
    }
  };
};
