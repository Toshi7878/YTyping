import { useGameRef } from "@/app/type/atoms/refAtoms";
import { useRetry } from "@/app/type/hooks/playing-hooks/useRetry";
import PlayingBottomBadge from "./child/PlayingBottomBadge";

const PlayingRetryBadge = function () {
  const retry = useRetry();
  const { readGameRef } = useGameRef();
  return (
    <PlayingBottomBadge
      badgeText="やり直し"
      kbdText="F4"
      onClick={() => {
        const playMode = readGameRef().playMode;

        retry(playMode);
      }}
      isPauseDisabled={true}
      isKbdHidden={false}
    />
  );
};

export default PlayingRetryBadge;
