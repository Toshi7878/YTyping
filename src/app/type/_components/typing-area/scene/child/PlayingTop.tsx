import { HStack } from "@chakra-ui/react";
import PlayingProgress from "../playing-child/child/PlayingProgress";

import PlayingCombo from "./top-child/PlayingCombo";
import PlayingLineTime from "./top-child/PlayingLineTime";
import PlayingNotify from "./top-child/PlayingNotify";
import { useSceneAtom } from "@/app/type/type-atoms/gameRenderAtoms";

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
