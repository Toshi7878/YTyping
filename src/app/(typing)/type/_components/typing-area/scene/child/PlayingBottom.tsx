import { useSceneGroupState, useYTStartedState } from "@/app/(typing)/type/atoms/stateAtoms";
import { useLinkClick } from "@/utils/global-hooks/useLinkClick";
import { Link } from "@chakra-ui/next-js";
import { Box, Button, Flex, HStack } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import Progress from "./Progress";
import PlayingSkipGuide from "./bottom-child/PlayingSkipGuide";
import PlayingTotalTime from "./bottom-child/PlayingTotalTime";
import PracticeBadges from "./bottom-child/child/PracticeBadgeLayout";
import RetryBadge from "./bottom-child/child/RetryBadge";
import SpeedBadge from "./bottom-child/child/SpeedBadge";

const PlayingBottom = function () {
  const isYTStarted = useYTStartedState();
  const sceneGroup = useSceneGroupState();
  const isPlayed = isYTStarted && sceneGroup === "Playing";
  const { id: mapId } = useParams();
  const handleLinkClick = useLinkClick();

  return (
    <>
      <HStack
        justifyContent="space-between"
        mx={2}
        fontWeight="bold"
        visibility={isPlayed ? "visible" : "hidden"}
        className={"bottom-card-text"}
        fontSize={{ base: "3rem", sm: "2.5rem", md: "xl" }}
      >
        <PlayingSkipGuide />
        <PlayingTotalTime />
      </HStack>
      <Box>
        <Progress id="total_progress" />
      </Box>
      <Flex
        justifyContent="space-between"
        mx={3}
        mt={2}
        mb={4}
        fontWeight="bold"
        visibility={isPlayed ? "visible" : "hidden"}
      >
        <SpeedBadge />
        <PracticeBadges />
        <RetryBadge />
      </Flex>
      {sceneGroup === "Ready" && (
        <Link href={`/ime/${mapId}`} onClick={(event) => handleLinkClick(event, "replace")}>
          <Button
            p={{ base: 8, md: "2" }}
            fontSize={{ base: "2xl", md: "md" }}
            position="absolute"
            bottom="3"
            right="10"
          >
            変換有りタイピング
          </Button>
        </Link>
      )}
    </>
  );
};

export default PlayingBottom;
