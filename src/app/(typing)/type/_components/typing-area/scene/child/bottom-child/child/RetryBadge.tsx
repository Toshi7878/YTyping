import { useReadGameUtilParams } from "@/app/(typing)/type/atoms/stateAtoms";
import { useRetry } from "@/app/(typing)/type/hooks/playing-hooks/retry";
import BottomBadge from "./child/BottomBadge";

const RetryBadge = function () {
  const retry = useRetry();
  const readGameStateUtils = useReadGameUtilParams();
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
