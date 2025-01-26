import { useUserOptionsAtom } from "@/app/type/type-atoms/gameRenderAtoms";
import { Box, CheckboxGroup, Flex, Text } from "@chakra-ui/react";
import CheckBoxOption from "./child/CheckBoxOption";

const UserSoundEffectCheckbox = () => {
  const userOptionsAtom = useUserOptionsAtom();

  return (
    <Flex>
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          効果音
        </Text>
        <CheckboxGroup>
          <CheckBoxOption
            label={"タイプ音"}
            name="typeSound"
            defaultChecked={userOptionsAtom.type_sound}
          />
          <CheckBoxOption
            label={"ミス音"}
            name="missSound"
            defaultChecked={userOptionsAtom.miss_sound}
          />
          <CheckBoxOption
            label={"打ち切り音"}
            name="lineClearSound"
            defaultChecked={userOptionsAtom.line_clear_sound}
          />
        </CheckboxGroup>
      </Box>
    </Flex>
  );
};

export default UserSoundEffectCheckbox;
