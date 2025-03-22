import { useIsWordConvertingState, useSetWordState, useWordState } from "@/app/edit/atoms/stateAtoms";
import { useWordConvertButtonEvent } from "@/app/edit/hooks/useButtonEvents";
import { ThemeColors } from "@/types";
import { Button, Flex, Input, useTheme } from "@chakra-ui/react";

interface DirectEditWordInputProps {
  directEditWordInputRef: React.RefObject<HTMLInputElement>;
}

const DirectEditWordInput = (props: DirectEditWordInputProps) => {
  const theme: ThemeColors = useTheme();
  const isLoadWordConvert = useIsWordConvertingState();
  const selectWord = useWordState();

  const wordConvertButtonEvent = useWordConvertButtonEvent();
  const setWord = useSetWordState();

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
        onChange={(e) => setWord(e.target.value)}
      />
    </Flex>
  );
};

export default DirectEditWordInput;
