import React from "react";
import { Box, CheckboxGroup, Flex, Text } from "@chakra-ui/react";
import CheckBoxOption from "./child/CheckBoxOption";
import { useUserOptionsAtom } from "@/app/type/type-atoms/gameRenderAtoms";

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
            defaultChecked={userOptionsAtom.typeSound}
          />
          <CheckBoxOption
            label={"ミス音"}
            name="missSound"
            defaultChecked={userOptionsAtom.missSound}
          />
          <CheckBoxOption
            label={"打ち切り音"}
            name="lineClearSound"
            defaultChecked={userOptionsAtom.lineClearSound}
          />
        </CheckboxGroup>
      </Box>
    </Flex>
  );
};

export default UserSoundEffectCheckbox;
