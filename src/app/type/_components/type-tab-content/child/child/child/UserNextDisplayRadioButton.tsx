import {
  useSetIsOptionEdited,
  useSetUserOptionsAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { Box, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";

const UserNextDisplayRadioButton = () => {
  const setUserOptionsAtom = useSetUserOptionsAtom();
  const userOptionsAtom = useUserOptionsAtom();
  const setIsOptionEdited = useSetIsOptionEdited();

  const changeRadio = (value: $Enums.next_display) => {
    if (!userOptionsAtom) return;

    const newUserOptions = {
      ...userOptionsAtom,
      next_display: value,
    };
    setUserOptionsAtom(newUserOptions);
    setIsOptionEdited(true);
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
