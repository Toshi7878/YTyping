import { useCallback } from "react";
import { useWindowFocus } from "../../../../../utils/global-hooks/windowFocus";
import { usePlayer, useYTStatus } from "../../_lib/atoms/refAtoms";
import { useReadGameUtilParams } from "../../_lib/atoms/stateAtoms";

const MobileCover = () => {
  const windowFocus = useWindowFocus();
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useYTStatus();

  const readGameStateUtils = useReadGameUtilParams();
  const handleStart = useCallback(
    async () => {
      const { scene } = readGameStateUtils();

      if (readYTStatus().isPaused || scene === "ready") {
        readPlayer().playVideo();
      } else {
        readPlayer().pauseVideo();
      }

      windowFocus();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <div
      id="mobile_cover"
      className="absolute inset-0 z-[5] cursor-pointer items-center rounded-lg transition-opacity duration-300"
      onClick={handleStart}
    />
  );
};

export default MobileCover;
