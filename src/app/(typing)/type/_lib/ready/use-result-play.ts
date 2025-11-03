import { useQueryClient } from "@tanstack/react-query";
import { useGlobalLoadingOverlay, useUserAgent } from "@/lib/global-atoms";
import { useTRPC } from "@/trpc/provider";
import { readYTPlayer } from "../atoms/read-atoms";
import { useInitializeLineResults, useSetPlayingInputMode, useSetScene } from "../atoms/state-atoms";
import type { PlayMode } from "../type";

export const useResultPlay = ({ startMode }: { startMode: Exclude<PlayMode, "playing"> }) => {
  const initializeLineResults = useInitializeLineResults();
  const setPlayingInputModeState = useSetPlayingInputMode();
  const setScene = useSetScene();
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const userAgent = useUserAgent();
  return async (resultId: number | null) => {
    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;

    if (userAgent?.getDevice().type !== "desktop") {
      YTPlayer.playVideo();
      YTPlayer.pauseVideo();
    }

    setScene(startMode);
    try {
      if (resultId) {
        showLoading({ message: "リザルトデータを読込中..." });
        const resultData = await queryClient.ensureQueryData(trpc.result.getResultJson.queryOptions({ resultId }));

        console.log(resultData);
        if (startMode === "replay") {
          const mode = resultData[0]?.status?.mode ?? "roma";
          setPlayingInputModeState(mode);
        }
        initializeLineResults(resultData);
      }
    } finally {
      YTPlayer.playVideo();
      hideLoading();
    }
  };
};
