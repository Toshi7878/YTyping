import { useRefs } from "@/app/edit/edit-contexts/refsProvider";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Input, useTheme } from "@chakra-ui/react";
import React, { useState } from "react";

interface DirectEditTimeInputProps {
  directEditTimeInputRef: React.RefObject<HTMLInputElement>;
  editTime: string;
}

const DirectEditTimeInput = (props: DirectEditTimeInputProps) => {
  const [editTime, setEditTime] = useState(props.editTime);

  const theme: ThemeColors = useTheme();
  const { timeInputRef, playerRef } = useRefs();

  return (
    <CustomToolTip tooltipLabel={"↓↑: 0.05ずつ調整, Enter:再生"} placement="top">
      <Input
        ref={props.directEditTimeInputRef}
        size="xs"
        type="number"
        value={editTime}
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}60`}
        onChange={(e) => {
          const newValue = e.target.value;
          setEditTime(newValue);
          timeInputRef.current!.value = newValue;
        }}
        onKeyDown={(e) => {
          const value = e.currentTarget.value;

          if (e.code === "ArrowUp") {
            const newValue = (Number(value) - 0.05).toFixed(3);
            setEditTime(newValue);
            timeInputRef.current!.value = newValue;
            e.preventDefault();
          } else if (e.code === "ArrowDown") {
            const newValue = (Number(value) + 0.05).toFixed(3);
            setEditTime(newValue);
            timeInputRef.current!.value = newValue;
            e.preventDefault();
          } else if (e.code === "Enter") {
            playerRef.current.seekTo(Number(value));
          }
        }}
      />
    </CustomToolTip>
  );
};

export default DirectEditTimeInput;
