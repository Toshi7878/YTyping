import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { Box, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";

const UserNextDisplayRadioButton = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { next_display } = useUserTypingOptionsState();

  const changeRadio = (value: $Enums.next_display) => {
    setUserTypingOptions({ next_display: value });
  };

  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={2}>
        次の歌詞表示
      </Text>
      <RadioGroup size="lg" defaultValue={next_display} onChange={changeRadio}>
        <Stack direction="row" spacing={5}>
          <Radio value="LYRICS">歌詞</Radio>
          <Radio value="WORD">ワード</Radio>
        </Stack>
      </RadioGroup>
    </Box>
  );
};

export default UserNextDisplayRadioButton;
