import { Flex, UseDisclosureReturn } from "@chakra-ui/react";
import { useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import PlayingSpeedBadge from "./child/PlayingSpeedBadge";
import PlayingRetryBadge from "./child/PlayingRetryBadge";
import PlayingPracticeBadge from "./child/PlayingPracticeBadge";

const PlayingBottomBadgeLayout = function () {
  const scene = useSceneAtom();
  const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

  return (
    <Flex
      justifyContent="space-between"
      mx={3}
      mt={2}
      mb={4}
      fontWeight="bold"
      className={`${isPlayed ? "" : "invisible"}`}
    >
      <PlayingSpeedBadge />
      <PlayingPracticeBadge />
      <PlayingRetryBadge />
    </Flex>
  );
};

export default PlayingBottomBadgeLayout;
