import { useRetry } from "@/app/type/hooks/playing-hooks/useRetry";
import { useRefs } from "@/app/type/type-contexts/refsProvider";
import PlayingBottomBadge from "./child/PlayingBottomBadge";

const PlayingRetryBadge = function () {
  const retry = useRetry();
  const { gameStateRef } = useRefs();

  const playMode = gameStateRef.current!.playMode;
  return (
    <PlayingBottomBadge
      badgeText="やり直し"
      kbdText="F4"
      onClick={() => retry(playMode)}
      isPauseDisabled={true}
      isKbdHidden={false}
    />
  );
};

export default PlayingRetryBadge;
