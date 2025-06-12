"use client";
import { useSpeedReducer, useYTSpeedState } from "@/app/edit/atoms/stateAtoms";
import "@/app/edit/style/editor.scss";
import { Button } from "@/components/ui/button";

const EditSpeedChange = () => {
  const speed = useYTSpeedState(); //0.25 or 2.00 場合片方のボタンをdisabledにする
  const speedDispatch = useSpeedReducer();

  return (
    <div className="flex items-center justify-center gap-2 w-[170px]">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => speedDispatch("down")}
        className="p-1 h-auto"
      >
        <div className="relative">
          -
          <span className="f-key">
            F9
          </span>
        </div>
      </Button>
      <div>
        <span id="speed">
          {speed.toFixed(2)}
        </span>
        倍速
      </div>
      <Button 
        variant="ghost"
        size="sm" 
        onClick={() => speedDispatch("up")}
        className="p-1 h-auto"
      >
        <div className="relative">
          +
          <span className="f-key">
            F10
          </span>
        </div>
      </Button>
    </div>
  );
};

export default EditSpeedChange;
