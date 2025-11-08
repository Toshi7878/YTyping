import type React from "react";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { handlePlaySpeedAction, usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speed-reducer";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { isDialogOpen } from "@/utils/is-dialog-option";

const hotKeyOptions = {
  enableOnFormTags: false,
  preventDefault: true,
};

export const ReadyPlaySpeed = () => {
  const { minPlaySpeed } = usePlaySpeedState();
  const speedUpButtonRef = useRef<HTMLButtonElement>(null);
  const speedDownButtonRef = useRef<HTMLButtonElement>(null);

  useHotkeys(
    "F9",
    () => {
      if (isDialogOpen() || !speedDownButtonRef.current) return;
      speedDownButtonRef.current.click();
    },
    hotKeyOptions,
  );

  useHotkeys(
    "F10",
    () => {
      if (isDialogOpen() || !speedUpButtonRef.current) return;
      speedUpButtonRef.current?.click();
    },
    hotKeyOptions,
  );

  return (
    <TooltipWrapper
      label="1.00倍速未満の場合は練習モードになります。"
      side="top"
      delayDuration={0}
      open={minPlaySpeed < 1}
      sideOffset={-20}
    >
      <div className="border-border flex items-center rounded-lg border border-solid px-8 py-6 shadow-md md:py-3">
        <SpeedChangeButton buttonRef={speedDownButtonRef} buttonLabel={{ text: "-", key: "F9" }} type="down" />

        <div className="mx-8 text-3xl font-bold select-none md:text-4xl">
          <span id="speed">{minPlaySpeed.toFixed(2)}</span>
          倍速
        </div>

        <SpeedChangeButton buttonRef={speedUpButtonRef} buttonLabel={{ text: "+", key: "F10" }} type="up" />
      </div>
    </TooltipWrapper>
  );
};

interface SpeedChangeButtonProps {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  buttonLabel: {
    text: string;
    key: string;
  };
  type: "up" | "down";
}

// TODO: UIに汎用化
const SpeedChangeButton = (props: SpeedChangeButtonProps) => {
  return (
    <Button
      variant="unstyled"
      ref={props.buttonRef}
      className="text-primary-light hover:text-primary-light/90 px-4 py-3 font-bold"
      onClick={() => handlePlaySpeedAction({ type: props.type })}
    >
      <div className="relative top-1 text-3xl md:text-2xl">
        {props.buttonLabel.text}
        <small className="absolute -top-[0.9em] left-1/2 -translate-x-1/2 text-[65%]">{props.buttonLabel.key}</small>
      </div>
    </Button>
  );
};
