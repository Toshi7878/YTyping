import { usePlayer, useTimeInput } from "@/app/edit/atoms/refAtoms";
import { Input } from "@/components/ui/input/input";
import { TooltipWrapper } from "@/components/ui/tooltip";
import React, { useState } from "react";

interface DirectEditTimeInputProps {
  directEditTimeInputRef: React.RefObject<HTMLInputElement | null>;
  editTime: string;
}

const DirectEditTimeInput = (props: DirectEditTimeInputProps) => {
  const [editTime, setEditTime] = useState(props.editTime);

  const { setTime } = useTimeInput();
  const { readPlayer } = usePlayer();

  return (
    <TooltipWrapper label={"↓↑: 0.05ずつ調整, Enter:再生"}>
      <Input
        ref={props.directEditTimeInputRef}
        className="h-6 text-xs"
        type="number"
        value={editTime}
        onChange={(e) => {
          const newValue = e.target.value;
          setEditTime(newValue);
          setTime(newValue);
        }}
        onKeyDown={(e) => {
          const value = e.currentTarget.value;

          if (e.code === "ArrowUp") {
            const newValue = (Number(value) - 0.05).toFixed(3);
            setEditTime(newValue);
            setTime(newValue);
            e.preventDefault();
          } else if (e.code === "ArrowDown") {
            const newValue = (Number(value) + 0.05).toFixed(3);
            setEditTime(newValue);
            setTime(newValue);
            e.preventDefault();
          } else if (e.code === "Enter") {
            readPlayer().seekTo(Number(value), true);
          }
        }}
      />
    </TooltipWrapper>
  );
};

export default DirectEditTimeInput;
