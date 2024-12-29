import { Input, useTheme } from "@chakra-ui/react";
import { useEffect, useRef } from "react";

import { useSetEditIsTimeInputValidAtom } from "@/app/edit/edit-atom/editAtom";
import { useRefs } from "@/app/edit/edit-contexts/refsProvider";
import { ThemeColors } from "@/types";

const EditorTimeInput = () => {
  const theme: ThemeColors = useTheme();
  const timeInputRef = useRef<HTMLInputElement>(null);
  const setEditIsTimeInputValid = useSetEditIsTimeInputValidAtom();

  const { setRef } = useRefs();

  useEffect(() => {
    setRef("timeInputRef", timeInputRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Input
      ref={timeInputRef}
      placeholder="Time"
      size="sm"
      width="90px"
      type="number"
      bg={theme.colors.background.body}
      borderColor={`${theme.colors.border.card}60`}
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
