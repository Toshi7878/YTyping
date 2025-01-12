import { useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box, Flex, HStack } from "@chakra-ui/react";
import PlayingProgress from "../playing-child/child/PlayingProgress";
import PlayingBottomBadgeLayout from "./bottom-child/PlayingBottomBadgeLayout";
import PlayingSkipGuide from "./bottom-child/PlayingSkipGuide";
import PlayingTotalTime from "./bottom-child/PlayingTotalTime";

const PlayingBottom = function () {
  const scene = useSceneAtom();
  const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

  return (
    <>
      <HStack
        justifyContent="space-between"
        mx={2}
        fontWeight="bold"
        className={`${isPlayed ? "" : "invisible"} bottom-card-text`}
        fontSize={{ base: "3rem", sm: "2.5rem", md: "xl" }}
      >
        <PlayingSkipGuide />
        <PlayingTotalTime />
      </HStack>
      <Box>
        <PlayingProgress id="total_progress" />
      </Box>
      <Flex
        justifyContent="space-between"
        mx={3}
        mt={2}
        mb={4}
        fontWeight="bold"
        className={`${isPlayed ? "" : "invisible"}`}
        userSelect="none"
      >
        <PlayingBottomBadgeLayout />
      </Flex>
    </>
  );
};

export default PlayingBottom;
