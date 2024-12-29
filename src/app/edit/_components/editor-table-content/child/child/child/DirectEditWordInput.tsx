import {
  useEditLineWordAtom,
  useIsLoadWordConvertAtom,
  useSetEditLineWordAtom,
} from "@/app/edit/edit-atom/editAtom";
import { useWordConvertButtonEvent } from "@/app/edit/hooks/useEditorButtonEvents";
import { ThemeColors } from "@/types";
import { Button, Flex, Input, useTheme } from "@chakra-ui/react";

interface DirectEditWordInputProps {
  directEditWordInputRef: React.RefObject<HTMLInputElement>;
}

const DirectEditWordInput = (props: DirectEditWordInputProps) => {
  const theme: ThemeColors = useTheme();
  // const isConvertButtonDisabled = useIsConvertButtonDisabled();
  const isLoadWordConvert = useIsLoadWordConvertAtom();
  const selectWord = useEditLineWordAtom();

  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const setWord = useSetEditLineWordAtom();

  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Button
        isDisabled={false}
        isLoading={isLoadWordConvert}
        variant="outline"
        size="sm"
        height="35px"
        width="8%"
        color={theme.colors.text.body}
        _hover={{ bg: `${theme.colors.secondary.main}60` }}
        borderColor={theme.colors.secondary.main}
        onClick={wordConvertButtonEvent}
      >
        変換
      </Button>
      <Input
        ref={props.directEditWordInputRef}
        width="91%"
        size="sm"
        autoComplete="off"
        value={selectWord}
        bg={theme.colors.background.body}
        borderColor={`${theme.colors.border.card}60`}
        onChange={(e) => setWord(e.target.value)}
      />
    </Flex>
  );
};

export default DirectEditWordInput;
