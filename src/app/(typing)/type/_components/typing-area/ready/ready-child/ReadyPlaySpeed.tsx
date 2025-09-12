import { usePlaySpeedReducer, usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import { Button } from "@/components/ui/button";
import { TooltipWrapper } from "@/components/ui/tooltip";
import React from "react";

interface ReadyPlaySpeedProps {
  speedUpButtonRef: React.RefObject<HTMLButtonElement>;
  speedDownButtonRef: React.RefObject<HTMLButtonElement>;
}
const ReadyPlaySpeed = (props: ReadyPlaySpeedProps) => {
  const { defaultSpeed } = usePlaySpeedState();

  return (
    <TooltipWrapper
      label="1.00倍速未満の場合は練習モードになります。"
      side="top"
      delayDuration={0}
      open={defaultSpeed < 1}
      sideOffset={-20}
    >
      <div className="border-border flex items-center rounded-lg border border-solid px-8 py-6 shadow-md md:py-3">
        <SpeedChangeButton buttonRef={props.speedDownButtonRef} buttonLabel={{ text: "-", key: "F9" }} type="down" />

        <div className="mx-8 text-3xl font-bold select-none md:text-4xl">
          <span id="speed">{defaultSpeed.toFixed(2)}</span>
          倍速
        </div>

        <SpeedChangeButton buttonRef={props.speedUpButtonRef} buttonLabel={{ text: "+", key: "F10" }} type="up" />
      </div>
    </TooltipWrapper>
  );
};

interface SpeedChangeButtonProps {
  buttonRef: React.RefObject<HTMLButtonElement>;
  buttonLabel: {
    text: string;
    key: string;
  };
  type: "up" | "down";
}

const SpeedChangeButton = (props: SpeedChangeButtonProps) => {
  const dispatchSpeed = usePlaySpeedReducer();

  return (
    <Button
      variant="unstyled"
      ref={props.buttonRef}
      className="text-primary-light hover:text-primary-light/90 px-4 py-3 font-bold"
      onClick={() => dispatchSpeed({ type: props.type })}
    >
      <div className="relative top-1 text-3xl md:text-2xl">
        {props.buttonLabel.text}
        <small className="absolute -top-[0.9em] left-1/2 -translate-x-1/2 text-[65%]">{props.buttonLabel.key}</small>
      </div>
    </Button>
  );
};

export default ReadyPlaySpeed;
