import { useSceneState, useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { useMoveLine } from "@/app/(typing)/type/hooks/playing-hooks/moveLine";
import { useToggleLineList } from "@/app/(typing)/type/hooks/playing-hooks/toggleLineList";
import BottomBadge from "./child/BottomBadge";
import BottomDoubleKeyBadge from "./child/BottomDoubleKeyBadge";

const PracticeBadges = function () {
  const scene = useSceneState();
  const toggleLineListDrawer = useToggleLineList();
  const { movePrevLine, moveNextLine } = useMoveLine();
  const userOptions = useUserTypingOptionsState();

  return (
    <>
      {scene !== "play" && (
        <>
          <BottomDoubleKeyBadge
            badgeText="移動"
            kbdTextPrev="←"
            kbdTextNext="→"
            onClick={() => {}}
            onClickPrev={() => movePrevLine()}
            onClickNext={() => moveNextLine()}
          />
          <BottomBadge
            badgeText="リスト"
            kbdText={userOptions.toggle_input_mode_key === "TAB" ? "F1" : "Tab"}
            onClick={() => toggleLineListDrawer()}
            isPauseDisabled={false}
            isKbdHidden={false}
          />
        </>
      )}
    </>
  );
};

export default PracticeBadges;
