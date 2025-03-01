import {
  useSetIsOptionEdited,
  useSetUserOptionsAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { Box, Radio, RadioGroup, Stack, Text } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";

const UserLineCompletedRadioButton = () => {
  const setUserOptionsAtom = useSetUserOptionsAtom();
  const userOptionsAtom = useUserOptionsAtom();
  const setIsOptionEdited = useSetIsOptionEdited();

  const changeRadio = (value: $Enums.line_completed_display) => {
    if (!userOptionsAtom) return;

    const newUserOptions = {
      ...userOptionsAtom,
      line_completed_display: value,
    };
    setUserOptionsAtom(newUserOptions);
    setIsOptionEdited(true);
  };
  return (
    <Box>
      <Text fontWeight="semibold" mb={2}>
        ラインクリア表示
      </Text>
      <RadioGroup
        size="lg"
        defaultValue={userOptionsAtom.line_completed_display}
        onChange={changeRadio}
      >
        <Stack direction="row" spacing={5}>
          <Radio value="HIGH_LIGHT">ワードハイライト</Radio>
          <Radio value="NEXT_WORD">次のワード</Radio>
        </Stack>
      </RadioGroup>
    </Box>
  );
};

export default UserLineCompletedRadioButton;
