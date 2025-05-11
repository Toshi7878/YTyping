import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Box, Flex, Select, Text } from "@chakra-ui/react";
import { $Enums } from "@prisma/client";
import React from "react";

const UserShortcutKeyCheckbox = () => {
  const { time_offset_key, toggle_input_mode_key } = useUserTypingOptionsState();
  const { setUserTypingOptions } = useSetUserTypingOptionsState();

  const changeTimeOffsetKey = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as $Enums.time_offset_key;
    setUserTypingOptions({ time_offset_key: value });
  };

  const changeInputModeKey = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value as $Enums.toggle_input_mode_key;
    setUserTypingOptions({ toggle_input_mode_key: value });
  };

  return (
    <Flex>
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          ショートカットキー設定
        </Text>
        <Flex alignItems="baseline" mb={4}>
          <Text mr={2}>タイミング調整</Text>
          <Select onChange={changeTimeOffsetKey} width="fit-content" defaultValue={time_offset_key}>
            <option value="CTRL_LEFT_RIGHT">Ctrl+←→</option>
            <option value="CTRL_ALT_LEFT_RIGHT">Ctrl+Alt+←→</option>
            <option value="NONE">無効化</option>
          </Select>
        </Flex>
        <Flex alignItems="baseline">
          <Text mr={2}>かな⇔ローマ字切り替え</Text>
          <Select onChange={changeInputModeKey} width="fit-content" defaultValue={toggle_input_mode_key}>
            <option value="ALT_KANA">Alt+Kana</option>
            <option value="TAB">Tab</option>
            <option value="NONE">無効化</option>
          </Select>
        </Flex>
      </Box>
    </Flex>
  );
};

export default UserShortcutKeyCheckbox;
