import { useQueryClient } from "@tanstack/react-query";
import { useGlobalLoadingOverlay } from "@/lib/atoms/global-atoms";
import { readIsDesktopDevice } from "@/lib/atoms/user-agent";
import { useTRPC } from "@/trpc/provider";
import { initializeAllLineResult } from "../atoms/family";
import { readYTPlayer } from "../atoms/ref";
import { setPlayingInputMode, setScene } from "../atoms/state";
import type { PlayMode } from "../type";

export const useLoadResultAndStartPlay = ({ startMode }: { startMode: Exclude<PlayMode, "playing"> }) => {
  const { showLoading, hideLoading } = useGlobalLoadingOverlay();
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  return async (resultId: number | null) => {
    const YTPlayer = readYTPlayer();
    if (!YTPlayer) return;

    const isDesktop = readIsDesktopDevice();
    if (!isDesktop) {
      YTPlayer.playVideo();
      YTPlayer.pauseVideo();
    }

    setScene(startMode);
    try {
      if (resultId) {
        showLoading({ message: "リザルトデータを読込中..." });
        const resultData = await queryClient.ensureQueryData(trpc.result.getResultJson.queryOptions({ resultId }));

        if (startMode === "replay") {
          const mode = resultData[0]?.status?.mode ?? "roma";
          setPlayingInputMode(mode);
        }
        initializeAllLineResult(resultData);
      }
    } finally {
      YTPlayer.playVideo();
      hideLoading();
    }
  };
};
