import { clientApi } from "@/trpc/client-api";
import { PlayMode } from "../ts/type";
import { useSetIsLoadingOverlayAtom, useSetLineResultsAtom } from "../type-atoms/gameRenderAtoms";
import { useRefs } from "../type-contexts/refsProvider";

export const useOnClickPracticeReplay = ({
  startMode,
  resultId,
}: {
  startMode: Exclude<PlayMode, "playing">;
  resultId: number | null;
}) => {
  const setIsLoadingOverlay = useSetIsLoadingOverlayAtom();
  const setLineResults = useSetLineResultsAtom();
  const { gameStateRef, playerRef } = useRefs();
  const utils = clientApi.useUtils();

  const handleClick = async () => {
    try {
      if (resultId) {
        setIsLoadingOverlay(true);
        const resultData = await utils.result.getUserResultData.ensureData({ resultId });
        setLineResults(resultData);
      }
    } catch {
    } finally {
      setIsLoadingOverlay(false);
      playerRef.current?.playVideo();
      gameStateRef.current!.playMode = startMode;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return handleClick;
};
