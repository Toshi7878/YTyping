import { Box, HStack, UseDisclosureReturn } from "@chakra-ui/react";
import PlayingProgress from "../playing-child/child/PlayingProgress";
import PlayingSkipGuide from "./bottom-child/child/PlayingSkipGuide";
import PlayingTotalTime from "./bottom-child/child/PlayingTotalTime";
import { useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import PlayingBottomBadgeLayout from "./bottom-child/child/PlayingBottomBadgeLayout";

interface PlayingBottomRef {
  drawerClosure: UseDisclosureReturn;
}

const PlayingBottom = function ({ drawerClosure }: PlayingBottomRef) {
  const scene = useSceneAtom();
  const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

  return (
    <>
      <HStack
        justifyContent="space-between"
        mx={2}
        fontWeight="bold"
        className={`${isPlayed ? "" : "invisible"} bottom-card-text`}
      >
        <PlayingSkipGuide />
        <PlayingTotalTime />
      </HStack>
      <Box>
        <PlayingProgress id="total_progress" />
      </Box>
      <PlayingBottomBadgeLayout drawerClosure={drawerClosure} />
    </>
  );
};

export default PlayingBottom;
