import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { Box, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";

const UserLineCompletedRadioButton = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { line_completed_display } = useUserTypingOptionsState();

  const changeRadio = (value: $Enums.line_completed_display) => {
    setUserTypingOptions({ line_completed_display: value });
  };

  return (
    <Box>
      <Text fontWeight="semibold" mb={2}>
        打ち切り時のワード表示
      </Text>
      <RadioGroup size="lg" defaultValue={line_completed_display} onChange={changeRadio}>
        <Stack direction="row" spacing={5}>
          <Radio value="HIGH_LIGHT">ワードハイライト</Radio>
          <Radio value="NEXT_WORD">次のワードを表示</Radio>
        </Stack>
      </RadioGroup>
    </Box>
  );
};

export default UserLineCompletedRadioButton;
