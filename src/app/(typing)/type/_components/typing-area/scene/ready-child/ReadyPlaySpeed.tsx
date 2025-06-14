import { usePlaySpeedState } from "@/app/(typing)/type/atoms/speedReducerAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import React from "react";
import SpeedChangeButton from "./child/SpeedChangeButton";

interface ReadyPlaySpeedProps {
  speedUpButtonRef: React.RefObject<HTMLButtonElement>;
  speedDownButtonRef: React.RefObject<HTMLButtonElement>;
}
const ReadyPlaySpeed = (props: ReadyPlaySpeedProps) => {
  const { defaultSpeed } = usePlaySpeedState();

  return (
    <CustomToolTip
      label="1.00倍速未満の場合は練習モードになります。"
      placement="top"
      isDisabled={defaultSpeed >= 1}
      isOpen={defaultSpeed < 1}
      top={3}
    >
      <div className="flex items-center border border-white border-solid px-8 py-6 md:py-3 rounded-lg shadow-md">
        <SpeedChangeButton buttonRef={props.speedDownButtonRef} buttonLabel={{ text: "-", key: "F9" }} type="down" />

        <div className="font-bold mx-8 text-3xl md:text-4xl select-none">
          <span id="speed">
            {defaultSpeed.toFixed(2)}
          </span>
          倍速
        </div>

        <SpeedChangeButton buttonRef={props.speedUpButtonRef} buttonLabel={{ text: "+", key: "F10" }} type="up" />
      </div>
    </CustomToolTip>
  );
};

export default ReadyPlaySpeed;
