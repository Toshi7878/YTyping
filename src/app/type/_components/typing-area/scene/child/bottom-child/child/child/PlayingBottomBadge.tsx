import { usePlayingNotifyAtom, useSceneAtom } from "@/app/type/atoms/stateAtoms";
import { HStack } from "@chakra-ui/react";
import CustomBadge from "./child/CustomBadge";
import CustomKbd from "./child/CustomKbd";

interface PlayingBottomBadgeProps {
  badgeText: string;
  kbdText: string;
  isPauseDisabled: boolean;
  isKbdHidden: boolean;
  onClick: () => void;
}

const PlayingBottomBadge = function (props: PlayingBottomBadgeProps) {
  const notify = usePlayingNotifyAtom();
  const scene = useSceneAtom();
  const isDisabled = notify.description === "ll" && props.isPauseDisabled;
  const isHidden = scene === "ready" || scene === "end";

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

export default PlayingBottomBadge;
