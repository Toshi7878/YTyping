import { useGameStateUtilsRef } from "@/app/type/atoms/stateAtoms";
import { useRetry } from "@/app/type/hooks/playing-hooks/retry";
import PlayingBottomBadge from "./child/PlayingBottomBadge";

const PlayingRetryBadge = function () {
  const retry = useRetry();
  const readGameStateUtils = useGameStateUtilsRef();
  return (
    <PlayingBottomBadge
      badgeText="やり直し"
      kbdText="F4"
      onClick={() => {
        const { scene } = readGameStateUtils();

        if (scene === "play" || scene === "practice" || scene === "replay") {
          retry(scene);
        }
      }}
      isPauseDisabled={true}
      isKbdHidden={false}
    />
  );
};

export default PlayingRetryBadge;
