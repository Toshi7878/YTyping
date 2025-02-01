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
  const getUserResultData = clientApi.result.getUserResultData.useMutation();

  const handleClick = async () => {
    try {
      if (resultId) {
        setIsLoadingOverlay(true);
        const resultData = await getUserResultData.mutateAsync({ resultId });
        setLineResults(resultData);
      }
    } catch {
    } finally {
      setIsLoadingOverlay(false);
      playerRef.current?.playVideo();
      if (gameStateRef.current) {
        gameStateRef.current.playMode = startMode;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return handleClick;
};
