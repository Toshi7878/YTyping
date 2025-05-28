import { usePlayer } from "@/app/(typing)/type/atoms/refAtoms";
import { useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import VolumeRange from "@/components/share-components/VolumeRange";
import { useUserAgent } from "@/util/useUserAgent";
import { CheckboxGroup, Flex, Text } from "@chakra-ui/react";
import CheckBoxOption from "./child/CheckBoxOption";

const UserSoundEffectCheckbox = () => {
  const { type_sound, miss_sound, line_clear_sound } = useUserTypingOptionsState();
  const { readPlayer } = usePlayer();
  const { isMobile } = useUserAgent();

  return (
    <Flex flexDirection="column" gap={4}>
      <Text fontSize="lg" fontWeight="semibold">
        サウンド
      </Text>
      {!isMobile && <VolumeRange player={readPlayer()} />}
      <CheckboxGroup>
        <Flex flexDirection="row" gap={2}>
          <CheckBoxOption label={"タイプ音"} name="type_sound" defaultChecked={type_sound} />
          <CheckBoxOption label={"ミス音"} name="miss_sound" defaultChecked={miss_sound} />
          <CheckBoxOption label={"打ち切り音"} name="line_clear_sound" defaultChecked={line_clear_sound} />
        </Flex>
      </CheckboxGroup>
    </Flex>
  );
};

export default UserSoundEffectCheckbox;
