import { useMoveLine } from "@/app/type/hooks/playing-hooks/useMoveLine";
import { useToggleLineList } from "@/app/type/hooks/playing-hooks/useToggleLineList";
import { useSceneAtom, useUserOptionsAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import PlayingBottomBadge from "./child/PlayingBottomBadge";
import PlayingLineSeekBadge from "./child/PlayingLineSeekBadge";

const PlayingPracticeBadge = function () {
  const scene = useSceneAtom();
  const toggleLineListDrawer = useToggleLineList();
  const { movePrevLine, moveNextLine } = useMoveLine();
  const userOptionsAtom = useUserOptionsAtom();

  return (
    <>
      {scene !== "playing" && (
        <>
          <PlayingLineSeekBadge
            badgeText="ライン移動"
            kbdTextPrev="←"
            kbdTextNext="→"
            onClick={() => {}}
            onClickPrev={() => movePrevLine()}
            onClickNext={() => moveNextLine()}
          />
          <PlayingBottomBadge
            badgeText="ライン一覧"
            kbdText={userOptionsAtom.toggleInputModeKey === "tab" ? "F1" : "Tab"}
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
