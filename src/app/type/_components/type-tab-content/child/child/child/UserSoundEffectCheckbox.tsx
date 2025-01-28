import { useUserOptionsAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box, CheckboxGroup, Flex, Text } from "@chakra-ui/react";
import CheckBoxOption from "./child/CheckBoxOption";

const UserSoundEffectCheckbox = () => {
  const userTypingOptionsAtom = useUserOptionsAtom();

  return (
    <Flex>
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          効果音
        </Text>
        <CheckboxGroup>
          <CheckBoxOption
            label={"タイプ音"}
            name="type_sound"
            defaultChecked={userTypingOptionsAtom.type_sound}
          />
          <CheckBoxOption
            label={"ミス音"}
            name="miss_sound"
            defaultChecked={userTypingOptionsAtom.miss_sound}
          />
          <CheckBoxOption
            label={"打ち切り音"}
            name="line_clear_sound"
            defaultChecked={userTypingOptionsAtom.line_clear_sound}
          />
        </CheckboxGroup>
      </Box>
    </Flex>
  );
};

export default UserSoundEffectCheckbox;
