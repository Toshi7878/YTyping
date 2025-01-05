import { useRetry } from "@/app/type/hooks/playing-hooks/useRetry";
import PlayingBottomBadge from "./child/PlayingBottomBadge";

const PlayingRetryBadge = function () {
  const retry = useRetry();

  return (
    <PlayingBottomBadge
      badgeText="やり直し"
      kbdText="F4"
      onClick={retry}
      isPauseDisabled={true}
      isKbdHidden={false}
    />
  );
};

export default PlayingRetryBadge;
