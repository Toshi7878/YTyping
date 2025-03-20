import { usePlayer, useTimeInput } from "@/app/edit/atoms/refAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Input } from "@chakra-ui/react";
import React, { useState } from "react";

interface DirectEditTimeInputProps {
  directEditTimeInputRef: React.RefObject<HTMLInputElement>;
  editTime: string;
}

const DirectEditTimeInput = (props: DirectEditTimeInputProps) => {
  const [editTime, setEditTime] = useState(props.editTime);

  const { readTimeInput } = useTimeInput();
  const { readPlayer } = usePlayer();

  return (
    <CustomToolTip label={"↓↑: 0.05ずつ調整, Enter:再生"} placement="top">
      <Input
        ref={props.directEditTimeInputRef}
        size="xs"
        type="number"
        value={editTime}
        onChange={(e) => {
          const newValue = e.target.value;
          setEditTime(newValue);
          readTimeInput().value = newValue;
        }}
        onKeyDown={(e) => {
          const value = e.currentTarget.value;

          if (e.code === "ArrowUp") {
            const newValue = (Number(value) - 0.05).toFixed(3);
            setEditTime(newValue);
            readTimeInput().value = newValue;
            e.preventDefault();
          } else if (e.code === "ArrowDown") {
            const newValue = (Number(value) + 0.05).toFixed(3);
            setEditTime(newValue);
            readTimeInput().value = newValue;
            e.preventDefault();
          } else if (e.code === "Enter") {
            readPlayer().seekTo(Number(value), true);
          }
        }}
      />
    </CustomToolTip>
  );
};

export default DirectEditTimeInput;
