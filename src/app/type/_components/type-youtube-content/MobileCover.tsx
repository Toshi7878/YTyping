import { Box } from "@chakra-ui/react";
import { useCallback } from "react";
import { usePlayer, useYTStatusRef } from "../../atoms/refAtoms";
import { useSceneStateRef } from "../../atoms/stateAtoms";
import { useWindowFocus } from "../../hooks/useWindowFocus";

const MobileCover = () => {
  const windowFocus = useWindowFocus();
  const { readPlayer } = usePlayer();
  const { readYTStatus } = useYTStatusRef();

  const readScene = useSceneStateRef();
  const handleStart = useCallback(
    async () => {
      const scene = readScene();

      if (readYTStatus().isPaused || scene === "ready") {
        readPlayer().playVideo();
      } else {
        readPlayer().pauseVideo();
      }

      windowFocus();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <Box
      id="mobile_cover"
      cursor="pointer"
      position="absolute"
      alignItems="center"
      inset={0}
      transition="opacity 0.3s"
      borderRadius="lg"
      zIndex={5}
      onClick={handleStart}
    />
  );
};

export default MobileCover;
