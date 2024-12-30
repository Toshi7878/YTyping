import {
  useSetIsOptionEdited,
  useSetUserOptionsAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";

const UserNextDisplayRadioButton = () => {
  const setUserOptionsAtom = useSetUserOptionsAtom();
  const userOptionsAtom = useUserOptionsAtom();
  const setIsOptionEdited = useSetIsOptionEdited();

  const changeRadio = (value: string) => {
    // 引数を追加
    const newUserOptions: RouterOutPuts["userTypingOption"]["getUserTypingOptions"] = {
      ...userOptionsAtom,
      nextDisplay: value, // 選択された値を設定
    };
    setUserOptionsAtom(newUserOptions);
    setIsOptionEdited(true);
  };
  return (
    <Box>
      <Text fontSize="lg" fontWeight="semibold" mb={2}>
        次の歌詞表示
      </Text>
      <RadioGroup defaultValue={userOptionsAtom.nextDisplay} onChange={changeRadio}>
        <Stack direction="row" spacing={5}>
          <Radio value="lyrics">歌詞</Radio>
          <Radio value="word">ワード</Radio>
        </Stack>
      </RadioGroup>
    </Box>
  );
};

export default UserNextDisplayRadioButton;
