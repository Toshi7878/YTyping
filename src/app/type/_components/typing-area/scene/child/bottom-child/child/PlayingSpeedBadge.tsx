import { usePlaySpeedAtom, useSceneAtom } from "@/app/type/atoms/stateAtoms";
import { useVideoSpeedChange } from "@/app/type/hooks/useVideoSpeedChange";
import PlayingBottomBadge from "./child/PlayingBottomBadge";
import PlayingLineSeekBadge from "./child/PlayingLineSeekBadge";

const PlayingSpeedBadge = function () {
  const scene = useSceneAtom();
  const speedData = usePlaySpeedAtom();
  const { defaultSpeedChange, playingSpeedChange } = useVideoSpeedChange();

  return (
    <>
      {scene === "practice" ? (
        <PlayingLineSeekBadge
          badgeText={speedData.playSpeed.toFixed(2) + "倍速"}
          kbdTextPrev="F9-"
          kbdTextNext="+F10"
          onClick={() => {}}
          onClickPrev={() => defaultSpeedChange("down")}
          onClickNext={() => defaultSpeedChange("up")}
        />
      ) : (
        <PlayingBottomBadge
          badgeText={speedData.playSpeed.toFixed(2) + "倍速"}
          kbdText="F10"
          onClick={() => playingSpeedChange()}
          isPauseDisabled={true}
          isKbdHidden={scene === "replay" ? true : false}
        />
      )}
    </>
  );
};

export default PlayingSpeedBadge;
