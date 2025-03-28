import { usePlaySpeedReducer, usePlaySpeedState } from "@/app/type/atoms/speedReducerAtoms";
import { useSceneState } from "@/app/type/atoms/stateAtoms";
import PlayingBottomBadge from "./child/PlayingBottomBadge";
import PlayingLineSeekBadge from "./child/PlayingLineSeekBadge";

const PlayingSpeedBadge = function () {
  const scene = useSceneState();
  const speedData = usePlaySpeedState();
  const dispatchSpeed = usePlaySpeedReducer();
  return (
    <>
      {scene === "practice" ? (
        <PlayingLineSeekBadge
          badgeText={speedData.playSpeed.toFixed(2) + "倍速"}
          kbdTextPrev="F9-"
          kbdTextNext="+F10"
          onClick={() => {}}
          onClickPrev={() => dispatchSpeed({ type: "down" })}
          onClickNext={() => dispatchSpeed({ type: "up" })}
        />
      ) : (
        <PlayingBottomBadge
          badgeText={speedData.playSpeed.toFixed(2) + "倍速"}
          kbdText="F10"
          onClick={() => dispatchSpeed({ type: "toggle" })}
          isPauseDisabled={true}
          isKbdHidden={scene === "replay" ? true : false}
        />
      )}
    </>
  );
};

export default PlayingSpeedBadge;
