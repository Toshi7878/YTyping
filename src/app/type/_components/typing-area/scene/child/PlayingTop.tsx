import { HStack } from "@chakra-ui/react";
import PlayingProgress from "../playing-child/child/PlayingProgress";

import { useSceneGroupState, useYTStartedState } from "@/app/type/atoms/stateAtoms";
import PlayingCombo from "./top-child/PlayingCombo";
import PlayingLineTime from "./top-child/PlayingLineTime";
import PlayingNotify from "./top-child/PlayingNotify";

function PlayingTop() {
  const sceneGroup = useSceneGroupState();
  const isYTStarted = useYTStartedState();

  const isPlayed = isYTStarted && sceneGroup === "Playing";

  return (
    <>
      <HStack
        justify="space-between"
        mt={3}
        mb={1}
        mx={1}
        fontWeight="bold"
        fontFamily="mono"
        visibility={isPlayed ? "visible" : "hidden"}
        className={"top-card-text"}
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
