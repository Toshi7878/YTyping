"use client";
import { useSpeedReducer, useYTSpeedState } from "@/app/edit/atoms/stateAtoms";
import "@/app/edit/style/editor.scss";
import { Button } from "@/components/ui/button";

const EditSpeedChange = () => {
  const speed = useYTSpeedState(); //0.25 or 2.00 場合片方のボタンをdisabledにする
  const speedDispatch = useSpeedReducer();

  return (
    <div className="flex justify-center items-center w-[170px] gap-2">
      <Button variant="ghost" size="sm" onClick={() => speedDispatch("down")} className="cursor-pointer p-2">
        <div className="relative">
          -
          <span className="f-key">F9</span>
        </div>
      </Button>
      <div>
        <span id="speed">{speed.toFixed(2)}</span>
        倍速
      </div>
      <Button variant="ghost" size="sm" onClick={() => speedDispatch("up")} className="cursor-pointer p-2">
        <div className="relative">
          +
          <span className="f-key">F10</span>
        </div>
      </Button>
    </div>
  );
};

export default EditSpeedChange;
