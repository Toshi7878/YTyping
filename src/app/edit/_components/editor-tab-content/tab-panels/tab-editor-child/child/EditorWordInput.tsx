import { useEditLineWordAtom, useSetEditLineWordAtom } from "@/app/edit/edit-atom/editAtom";
import { ThemeColors } from "@/types";
import { Input, useTheme } from "@chakra-ui/react";

const EditorWordInput = () => {
  const theme: ThemeColors = useTheme();
  const word = useEditLineWordAtom();
  const setWord = useSetEditLineWordAtom();

  return (
    <Input
      placeholder="ワード"
      size="sm"
      autoComplete="off"
      bg={theme.colors.background.body}
      borderColor={`${theme.colors.border.card}60`}
      value={word}
      onChange={(e) => setWord(e.target.value)}
    />
  );
};

export default EditorWordInput;
