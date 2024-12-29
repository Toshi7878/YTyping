import { useEditLineSelectedCountAtom } from "@/app/edit/edit-atom/editAtom";
import { ThemeColors } from "@/types";
import { Input, useTheme } from "@chakra-ui/react";

const EditorSelectedLineCountInput = () => {
  const theme: ThemeColors = useTheme();
  const selectedLineCount = useEditLineSelectedCountAtom();
  return (
    <Input
      placeholder="No."
      size="sm"
      width="90px"
      disabled
      variant="filled"
      bg={theme.colors.background.body}
      borderColor={`${theme.colors.border.card}60`}
      opacity={1}
      _disabled={{ opacity: 1 }}
      value={selectedLineCount ?? ""}
    />
  );
};

export default EditorSelectedLineCountInput;
