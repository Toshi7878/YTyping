import { usePlaySpeedReducer, usePlaySpeedState } from "@/app/type/atoms/speedReducerAtoms";
import { useSceneState } from "@/app/type/atoms/stateAtoms";
import BottomBadge from "./child/BottomBadge";
import BottomDoubleKeyBadge from "./child/BottomDoubleKeyBadge";

const SpeedBadge = function () {
  const scene = useSceneState();
  const { playSpeed } = usePlaySpeedState();
  const dispatchSpeed = usePlaySpeedReducer();
  return (
    <>
      {scene === "practice" ? (
        <BottomDoubleKeyBadge
          badgeText={playSpeed.toFixed(2) + "倍速"}
          kbdTextPrev="F9-"
          kbdTextNext="+F10"
          onClick={() => {}}
          onClickPrev={() => dispatchSpeed({ type: "down" })}
          onClickNext={() => dispatchSpeed({ type: "up" })}
        />
      ) : (
        <BottomBadge
          badgeText={playSpeed.toFixed(2) + "倍速"}
          kbdText="F10"
          onClick={() => dispatchSpeed({ type: "toggle" })}
          isPauseDisabled={true}
          isKbdHidden={scene === "replay" ? true : false}
        />
      )}
    </>
  );
};

export default SpeedBadge;
