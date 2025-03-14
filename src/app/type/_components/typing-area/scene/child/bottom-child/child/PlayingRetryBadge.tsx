import { gameStateRefAtom } from "@/app/type/atoms/refAtoms";
import { useRetry } from "@/app/type/hooks/playing-hooks/useRetry";
import { useStore } from "jotai";
import PlayingBottomBadge from "./child/PlayingBottomBadge";

const PlayingRetryBadge = function () {
  const retry = useRetry();
  const typeAtomStore = useStore();
  return (
    <PlayingBottomBadge
      badgeText="やり直し"
      kbdText="F4"
      onClick={() => {
        const playMode = typeAtomStore.get(gameStateRefAtom).playMode;

        retry(playMode);
      }}
      isPauseDisabled={true}
      isKbdHidden={false}
    />
  );
};

export default PlayingRetryBadge;
