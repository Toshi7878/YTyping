import { useSceneState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { useMoveLine } from "@/app/type/hooks/playing-hooks/useMoveLine";
import { useToggleLineList } from "@/app/type/hooks/playing-hooks/useToggleLineList";
import PlayingBottomBadge from "./child/PlayingBottomBadge";
import PlayingLineSeekBadge from "./child/PlayingLineSeekBadge";

const PlayingPracticeBadge = function () {
  const scene = useSceneState();
  const toggleLineListDrawer = useToggleLineList();
  const { movePrevLine, moveNextLine } = useMoveLine();
  const userOptionsAtom = useUserTypingOptionsState();

  return (
    <>
      {scene !== "play" && (
        <>
          <PlayingLineSeekBadge
            badgeText="移動"
            kbdTextPrev="←"
            kbdTextNext="→"
            onClick={() => {}}
            onClickPrev={() => movePrevLine()}
            onClickNext={() => moveNextLine()}
          />
          <PlayingBottomBadge
            badgeText="リスト"
            kbdText={userOptionsAtom.toggle_input_mode_key === "TAB" ? "F1" : "Tab"}
            onClick={() => toggleLineListDrawer()}
            isPauseDisabled={false}
            isKbdHidden={false}
          />
        </>
      )}
    </>
  );
};

export default PlayingPracticeBadge;
