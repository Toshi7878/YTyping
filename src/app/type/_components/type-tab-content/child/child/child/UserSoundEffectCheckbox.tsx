import { usePlayer } from "@/app/type/atoms/refAtoms";
import { useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import VolumeRange from "@/components/share-components/VolumeRange";
import { IS_ANDROID, IS_IOS } from "@/config/consts/globalConst";
import { CheckboxGroup, Flex, Text } from "@chakra-ui/react";
import CheckBoxOption from "./child/CheckBoxOption";

const UserSoundEffectCheckbox = () => {
  const userTypingOptionsAtom = useUserTypingOptionsState();
  const { readPlayer } = usePlayer();

  return (
    <Flex flexDirection="column" gap={4}>
      <Text fontSize="lg" fontWeight="semibold">
        サウンド
      </Text>
      {!IS_IOS && !IS_ANDROID && <VolumeRange player={readPlayer()} />}
      <CheckboxGroup>
        <Flex flexDirection="row" gap={2}>
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
        </Flex>
      </CheckboxGroup>
    </Flex>
  );
};

export default UserSoundEffectCheckbox;
