import type React from "react";
import { useNotifyState, useSceneGroupState } from "@/app/(typing)/type/_lib/atoms/state-atoms";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { cn } from "@/lib/utils";

interface BottomBadgeProps {
  badgeText: string;
  kbdText: string;
  isPauseDisabled: boolean;
  isKbdHidden: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onClickCapture?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export const BottomButton = (props: BottomBadgeProps) => {
  const notify = useNotifyState();
  const sceneGroup = useSceneGroupState();
  const isDisabled = notify.description === "ll" && props.isPauseDisabled;
  const isHidden = sceneGroup === "Ready" || sceneGroup === "End";

  return (
    <div className={`flex items-center gap-2 ${isHidden ? "invisible" : "visible"}`}>
      <Button
        disabled={isDisabled}
        onClick={props.onClick}
        onClickCapture={props.onClickCapture}
        variant="outline-accent"
        className="rounded-full max-sm:p-9 text-4xl md:text-xl font-bold md:scale-100 hover:scale-105"
      >
        {props.badgeText}
      </Button>

      <Kbd
        onClick={props.onClick}
        onClickCapture={props.onClickCapture}
        disabled={isDisabled}
        className="bg-transparent text-xl hidden md:block"
      >
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

export const BottomDoubleKeyButton = (props: BottomDoubleKeyBadgeProps) => {
  const notify = useNotifyState();
  const sceneGroup = useSceneGroupState();
  const isDisabled = notify.description === "ll";
  const isHidden = sceneGroup === "Ready" || sceneGroup === "End";

  return (
    <div className={cn("flex items-center gap-2", isHidden && "hidden")}>
      <Kbd onClick={props.onClickPrev} disabled={isDisabled} className="bg-transparent text-5xl md:text-xl">
        {props.kbdTextPrev}
      </Kbd>
      <Button
        disabled={isDisabled}
        onClick={props.onClick}
        variant="accent"
        className="rounded-full border max-sm:p-9 text-4xl md:text-xl font-bold hover:scale-105"
      >
        {props.badgeText}
      </Button>
      <Kbd onClick={props.onClickNext} disabled={isDisabled} className="bg-transparent text-5xl md:text-xl">
        {props.kbdTextNext}
      </Kbd>
    </div>
  );
};
