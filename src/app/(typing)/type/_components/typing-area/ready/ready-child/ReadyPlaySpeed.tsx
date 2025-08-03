import { usePlaySpeedState } from "@/app/(typing)/type/_lib/atoms/speedReducerAtoms";
import { TooltipWrapper } from "@/components/ui/tooltip";
import React from "react";
import SpeedChangeButton from "./child/SpeedChangeButton";

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
      <div className="flex items-center rounded-lg border border-solid border-white px-8 py-6 shadow-md md:py-3">
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

export default ReadyPlaySpeed;
