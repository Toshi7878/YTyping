import { HStack } from "@chakra-ui/react";
import Progress from "./Progress";

import { useSceneGroupState, useYTStartedState } from "@/app/(typing)/type/atoms/stateAtoms";
import Combo from "./top-child/Combo";
import LineTime from "./top-child/LineTime";
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
        <Combo />
        <PlayingNotify />
        <LineTime />
      </HStack>
      <Progress id="line_progress" />
    </>
  );
}

export default PlayingTop;
