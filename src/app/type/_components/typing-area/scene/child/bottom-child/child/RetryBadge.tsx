import { useGameStateUtilsRef } from "@/app/type/atoms/stateAtoms";
import { useRetry } from "@/app/type/hooks/playing-hooks/retry";
import BottomBadge from "./child/BottomBadge";

const RetryBadge = function () {
  const retry = useRetry();
  const readGameStateUtils = useGameStateUtilsRef();
  return (
    <BottomBadge
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

export default RetryBadge;
