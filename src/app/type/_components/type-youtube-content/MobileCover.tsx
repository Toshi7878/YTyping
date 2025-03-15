import { Box } from "@chakra-ui/react";
import { useStore } from "jotai";
import { useCallback } from "react";
import { usePlayer, useYTStatusRef } from "../../atoms/refAtoms";
import { sceneAtom } from "../../atoms/stateAtoms";
import { useWindowFocus } from "../../hooks/useWindowFocus";

const MobileCover = () => {
  const typeAtomStore = useStore();
  const windowFocus = useWindowFocus();
  const { readPlayer } = usePlayer();
  const { readYTStatusRef } = useYTStatusRef();

  const handleStart = useCallback(
    async () => {
      const scene = typeAtomStore.get(sceneAtom);

      if (readYTStatusRef().isPaused || scene === "ready") {
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
