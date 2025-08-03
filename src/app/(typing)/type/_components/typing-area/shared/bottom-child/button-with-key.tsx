import { useNotifyState, useSceneGroupState } from "@/app/(typing)/type/_lib/atoms/stateAtoms";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Kbd from "../../../../../../../components/ui/kbd";

interface BottomBadgeProps {
  badgeText: string;
  kbdText: string;
  isPauseDisabled: boolean;
  isKbdHidden: boolean;
  onClick: () => void;
}

export const BottomButton = function (props: BottomBadgeProps) {
  const notify = useNotifyState();
  const sceneGroup = useSceneGroupState();
  const isDisabled = notify.description === "ll" && props.isPauseDisabled;
  const isHidden = sceneGroup === "Ready" || sceneGroup === "End";

  return (
    <div className={`flex items-center gap-2 ${isHidden ? "invisible" : "visible"}`}>
      <Button
        disabled={isDisabled}
        onClick={props.onClick}
        variant="outline-accent"
        className="rounded-full text-xl font-bold hover:scale-105"
      >
        {props.badgeText}
      </Button>

      <Kbd onClick={props.onClick} disabled={isDisabled} hidden={props.isKbdHidden}>
        {props.kbdText}
      </Kbd>
    </div>
  );
};

interface BottomDoubleKeyBadgeProps {
  badgeText: string;
  kbdTextPrev: string;
  kbdTextNext: string;
  onClick: () => void;
  onClickPrev: () => void;
  onClickNext: () => void;
}

export const BottomDoubleKeyButton = function (props: BottomDoubleKeyBadgeProps) {
  const notify = useNotifyState();
  const sceneGroup = useSceneGroupState();
  const isDisabled = notify.description === "ll";
  const isHidden = sceneGroup === "Ready" || sceneGroup === "End";

  return (
    <div className={cn("flex items-center gap-2", isHidden && "hidden")}>
      <Kbd onClick={props.onClickPrev} disabled={isDisabled}>
        {props.kbdTextPrev}
      </Kbd>
      <Button
        disabled={isDisabled}
        onClick={props.onClick}
        variant="accent"
        className="rounded-full border font-bold hover:scale-105"
      >
        {props.badgeText}
      </Button>
      <Kbd onClick={props.onClickNext} disabled={isDisabled}>
        {props.kbdTextNext}
      </Kbd>
    </div>
  );
};
