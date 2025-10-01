import { useQueryClient } from "@tanstack/react-query";
import { useGlobalLoadingOverlay } from "@/lib/global-atoms";
import { useTRPC } from "@/trpc/provider";
import { usePlayer } from "../atoms/read-atoms";
import { useInitializeLineResults, useSetPlayingInputMode, useSetScene } from "../atoms/state-atoms";
import type { PlayMode } from "../type";

export const useResultPlay = ({ startMode }: { startMode: Exclude<PlayMode, "playing"> }) => {
  const initializeLineResults = useInitializeLineResults();
  const { readPlayer } = usePlayer();
  const setPlayingInputModeState = useSetPlayingInputMode();
  const setScene = useSetScene();
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  return async (resultId: number | null) => {
    readPlayer().playVideo();
    readPlayer().pauseVideo();
    try {
      if (resultId) {
        showLoading({ message: "リザルトデータを読込中..." });
        const resultData = await queryClient.ensureQueryData(trpc.result.getResultJson.queryOptions({ resultId }));

        if (startMode === "replay") {
          const mode = resultData[0]?.status?.mode ?? "roma";
          setPlayingInputModeState(mode);
        }
        initializeLineResults(resultData);
      }
    } finally {
      readPlayer().playVideo();
      hideLoading();
      setScene(startMode);
    }
  };
};
