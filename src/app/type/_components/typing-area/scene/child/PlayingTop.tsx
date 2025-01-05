import { HStack } from "@chakra-ui/react";
import PlayingProgress from "../playing-child/child/PlayingProgress";

import { useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import PlayingCombo from "./top-child/PlayingCombo";
import PlayingLineTime from "./top-child/PlayingLineTime";
import PlayingNotify from "./top-child/PlayingNotify";

function PlayingTop() {
  const scene = useSceneAtom();

  const isPlayed = scene === "playing" || scene === "replay" || scene === "practice";

  return (
    <>
      <HStack
        justify="space-between"
        mt={3}
        mb={1}
        mx={1}
        fontWeight="bold"
        fontFamily="mono"
        className={`${isPlayed ? "" : "invisible"} top-card-text`}
        fontSize={{ base: "3.5rem", sm: "2.7rem", md: "3xl" }}
      >
        <PlayingCombo />
        <PlayingNotify />
        <PlayingLineTime />
      </HStack>
      <PlayingProgress id="line_progress" />
    </>
  );
}

export default PlayingTop;
