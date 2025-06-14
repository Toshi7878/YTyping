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
      <div
        className="flex justify-between items-center mt-3 mb-1 mx-1 font-bold font-mono top-card-text text-[3.5rem] sm:text-[2.7rem] md:text-3xl"
        style={{ visibility: isPlayed ? "visible" : "hidden" }}
      >
        <Combo />
        <PlayingNotify />
        <LineTime />
      </div>
      <Progress id="line_progress" />
    </>
  );
}

export default PlayingTop;
