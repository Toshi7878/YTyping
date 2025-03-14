import { clientApi } from "@/trpc/client-api";
import { useStore } from "jotai";
import { gameStateRefAtom, usePlayer } from "../atoms/refAtoms";
import { useSetIsLoadingOverlayAtom, useSetLineResultsAtom } from "../atoms/stateAtoms";
import { PlayMode } from "../ts/type";

export const useOnClickPracticeReplay = ({
  startMode,
  resultId,
}: {
  startMode: Exclude<PlayMode, "playing">;
  resultId: number | null;
}) => {
  const setIsLoadingOverlay = useSetIsLoadingOverlayAtom();
  const setLineResults = useSetLineResultsAtom();
  const player = usePlayer();
  const typeAtomStore = useStore();
  const utils = clientApi.useUtils();

  const handleClick = async () => {
    try {
      if (resultId) {
        setIsLoadingOverlay(true);
        const resultData = await utils.result.getUserResultData.ensureData({ resultId });
        setLineResults(resultData);
      }
    } finally {
      setIsLoadingOverlay(false);
      player.playVideo();
      typeAtomStore.set(gameStateRefAtom, (prev) => ({ ...prev, playMode: startMode }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  return handleClick;
};
