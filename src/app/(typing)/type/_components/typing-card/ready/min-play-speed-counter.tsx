import type React from "react";
import { useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { isDialogOpen } from "@/utils/is-dialog-option";
import { useMediaSpeedState } from "../../../_lib/atoms/state";
import { stepYTPlaybackRate } from "../../../_lib/atoms/youtube-player";

const hotKeyOptions = {
  enableOnFormTags: false,
  preventDefault: true,
};

export const ReadyPlaySpeed = () => {
  const playSpeed = useMediaSpeedState();
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
      open={playSpeed < 1}
      sideOffset={-20}
    >
      <div className="flex items-center rounded-lg border border-border border-solid px-8 py-6 shadow-md md:py-3">
        <SpeedChangeButton buttonRef={speedDownButtonRef} buttonLabel={{ text: "-", key: "F9" }} direction="down" />

        <div className="mx-8 select-none font-bold text-3xl md:text-4xl">
          <span id="speed">{playSpeed.toFixed(2)}</span>
          倍速
        </div>

        <SpeedChangeButton buttonRef={speedUpButtonRef} buttonLabel={{ text: "+", key: "F10" }} direction="up" />
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
  direction: "up" | "down";
}

// TODO: UIに汎用化
const SpeedChangeButton = (props: SpeedChangeButtonProps) => {
  return (
    <Button
      variant="unstyled"
      ref={props.buttonRef}
      className="px-4 py-3 font-bold text-primary-light hover:text-primary-light/90"
      onClick={() => {
        stepYTPlaybackRate(props.direction);
      }}
    >
      <div className="relative top-1 text-3xl md:text-2xl">
        {props.buttonLabel.text}
        <small className="absolute -top-[0.9em] left-1/2 -translate-x-1/2 text-[65%]">{props.buttonLabel.key}</small>
      </div>
    </Button>
  );
};
