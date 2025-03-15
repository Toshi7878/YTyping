import { useNotifyState, useSceneState } from "@/app/type/atoms/stateAtoms";
import { HStack } from "@chakra-ui/react";
import CustomBadge from "./child/CustomBadge";
import CustomKbd from "./child/CustomKbd";

interface PlayingLineSeekBadgeProps {
  badgeText: string;
  kbdTextPrev: string;
  kbdTextNext: string;
  onClick: () => void;
  onClickPrev: () => void;
  onClickNext: () => void;
}

const PlayingLineSeekBadge = function (props: PlayingLineSeekBadgeProps) {
  const notify = useNotifyState();
  const scene = useSceneState();
  const isDisabled = notify.description === "ll";
  const isHidden = scene === "ready" || scene === "end";

  return (
    <HStack hidden={isHidden}>
      <CustomKbd onClick={props.onClickPrev} isDisabled={isDisabled}>
        {props.kbdTextPrev}
      </CustomKbd>
      <CustomBadge isDisabled={isDisabled}>{props.badgeText}</CustomBadge>
      <CustomKbd onClick={props.onClickNext} isDisabled={isDisabled}>
        {props.kbdTextNext}
      </CustomKbd>
    </HStack>
  );
};

export default PlayingLineSeekBadge;
