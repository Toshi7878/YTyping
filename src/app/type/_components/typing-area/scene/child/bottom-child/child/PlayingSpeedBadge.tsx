import { useSceneAtom, useTypePageSpeedAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { useVideoSpeedChange } from "@/app/type/hooks/useVideoSpeedChange";
import PlayingLineSeekBadge from "./child/PlayingLineSeekBadge";
import PlayingBottomBadge from "./child/PlayingBottomBadge";

const PlayingSpeedBadge = function () {
  const scene = useSceneAtom();
  const speedData = useTypePageSpeedAtom();
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
