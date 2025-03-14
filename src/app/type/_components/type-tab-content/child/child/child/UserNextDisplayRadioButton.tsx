import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { Box, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";

const UserNextDisplayRadioButton = () => {
  const setUserOptionsAtom = useSetUserTypingOptionsState();
  const userOptionsAtom = useUserTypingOptionsState();
  const { writeGameUtils } = useGameUtilsRef();

  const changeRadio = (value: $Enums.next_display) => {
    if (!userOptionsAtom) return;

    const newUserOptions = {
      ...userOptionsAtom,
      next_display: value,
    };
    setUserOptionsAtom(newUserOptions);
    writeGameUtils({ isOptionEdited: true });
  };
  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={2}>
        次の歌詞表示
      </Text>
      <RadioGroup size="lg" defaultValue={userOptionsAtom.next_display} onChange={changeRadio}>
        <Stack direction="row" spacing={5}>
          <Radio value="LYRICS">歌詞</Radio>
          <Radio value="WORD">ワード</Radio>
        </Stack>
      </RadioGroup>
    </Box>
  );
};

export default UserNextDisplayRadioButton;
