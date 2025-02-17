import { Box } from "@chakra-ui/react";
import { useStore } from "jotai";
import { useCallback } from "react";
import { sceneAtom } from "../../type-atoms/gameRenderAtoms";
import { useRefs } from "../../type-contexts/refsProvider";

const MobileCover = () => {
  const { playerRef, ytStateRef } = useRefs();
  const typeAtomStore = useStore();

  const handleStart = useCallback(
    async () => {
      const scene = typeAtomStore.get(sceneAtom);
      if (ytStateRef.current?.isPaused || scene === "ready") {
        await playerRef.current?.playVideo();
      } else {
        await playerRef.current?.pauseVideo();
      }
      (document.activeElement as HTMLElement)?.blur();
      document.body.focus();
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
