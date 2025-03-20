import { Input } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import { useTimeInput } from "@/app/edit/atoms/refAtoms";
import { useSetIsTimeInputValidState } from "@/app/edit/atoms/stateAtoms";

const EditorTimeInput = () => {
  const timeInputRef = useRef<HTMLInputElement>(null);
  const setEditIsTimeInputValid = useSetIsTimeInputValidState();
  const { writeTimeInput } = useTimeInput();

  useEffect(() => {
    if (timeInputRef.current) {
      writeTimeInput(timeInputRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Input
      ref={timeInputRef}
      placeholder="Time"
      size="sm"
      width="90px"
      type="number"
      onChange={(e) => {
        setEditIsTimeInputValid(e.currentTarget.value ? false : true);
      }}
      onKeyDown={(e) => {
        const value = e.currentTarget.value;

        if (e.code === "ArrowDown") {
          const newValue = (Number(value) - 0.05).toFixed(3);
          e.currentTarget.value = newValue;

          e.preventDefault();
        } else if (e.code === "ArrowUp") {
          const newValue = (Number(value) + 0.05).toFixed(3);
          e.currentTarget.value = newValue;
          e.preventDefault();
        }
      }}
    />
  );
};

export default EditorTimeInput;
