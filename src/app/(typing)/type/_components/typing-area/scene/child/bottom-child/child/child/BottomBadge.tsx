import { useNotifyState, useSceneGroupState } from "@/app/(typing)/type/atoms/stateAtoms";
import { HStack } from "@chakra-ui/react";
import CustomBadge from "./child/CustomBadge";
import CustomKbd from "./child/CustomKbd";

interface BottomBadgeProps {
  badgeText: string;
  kbdText: string;
  isPauseDisabled: boolean;
  isKbdHidden: boolean;
  onClick: () => void;
}

const BottomBadge = function (props: BottomBadgeProps) {
  const notify = useNotifyState();
  const sceneGroup = useSceneGroupState();
  const isDisabled = notify.description === "ll" && props.isPauseDisabled;
  const isHidden = sceneGroup === "Ready" || sceneGroup === "End";

  return (
    <HStack visibility={isHidden ? "hidden" : "visible"}>
      <CustomBadge isDisabled={isDisabled} isKbdHidden={props.isKbdHidden} onClick={props.onClick}>
        {props.badgeText}
      </CustomBadge>

      <CustomKbd onClick={props.onClick} isDisabled={isDisabled} hidden={props.isKbdHidden}>
        {props.kbdText}
      </CustomKbd>
    </HStack>
  );
};

export default BottomBadge;
