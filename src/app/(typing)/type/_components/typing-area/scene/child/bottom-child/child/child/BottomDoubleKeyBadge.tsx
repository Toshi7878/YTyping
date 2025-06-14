import { useNotifyState, useSceneGroupState } from "@/app/(typing)/type/atoms/stateAtoms";
import CustomBadge from "./child/CustomBadge";
import CustomKbd from "./child/CustomKbd";

interface BottomDoubleKeyBadgeProps {
  badgeText: string;
  kbdTextPrev: string;
  kbdTextNext: string;
  onClick: () => void;
  onClickPrev: () => void;
  onClickNext: () => void;
}

const BottomDoubleKeyBadge = function (props: BottomDoubleKeyBadgeProps) {
  const notify = useNotifyState();
  const sceneGroup = useSceneGroupState();
  const isDisabled = notify.description === "ll";
  const isHidden = sceneGroup === "Ready" || sceneGroup === "End";

  return (
    <div className={`flex items-center gap-2 ${isHidden ? "hidden" : ""}`}>
      <CustomKbd onClick={props.onClickPrev} isDisabled={isDisabled}>
        {props.kbdTextPrev}
      </CustomKbd>
      <CustomBadge isDisabled={isDisabled}>{props.badgeText}</CustomBadge>
      <CustomKbd onClick={props.onClickNext} isDisabled={isDisabled}>
        {props.kbdTextNext}
      </CustomKbd>
    </div>
  );
};

export default BottomDoubleKeyBadge;
