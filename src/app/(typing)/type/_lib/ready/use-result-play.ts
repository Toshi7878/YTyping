import { useQueryClient } from "@tanstack/react-query";
import { useGlobalLoadingOverlay, useUserAgent } from "@/lib/global-atoms";
import { useTRPC } from "@/trpc/provider";
import { readYTPlayer } from "../atoms/read-atoms";
import { initializeAllLineResult, setPlayingInputMode, setScene } from "../atoms/state-atoms";
import type { PlayMode } from "../type";

export const useResultPlay = ({ startMode }: { startMode: Exclude<PlayMode, "playing"> }) => {
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
