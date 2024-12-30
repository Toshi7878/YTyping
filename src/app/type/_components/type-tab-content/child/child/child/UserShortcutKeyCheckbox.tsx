import {
  useSetIsOptionEdited,
  useSetUserOptionsAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, Flex, Select, Text } from "@chakra-ui/react";
import React from "react";

const UserShortcutKeyCheckbox = () => {
  const userOptionsAtom = useUserOptionsAtom();
  const setUserOptionsAtom = useSetUserOptionsAtom();
  const setIsOptionEdited = useSetIsOptionEdited();

  const changeTimeOffsetKey = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value; // 選択された値を取得
    const newUserOptions: RouterOutPuts["userTypingOption"]["getUserTypingOptions"] = {
      ...userOptionsAtom,
      timeOffsetKey: value, // 選択された値を設定
    };
    setUserOptionsAtom(newUserOptions);
    setIsOptionEdited(true);
  };

  const changeInputModeKey = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value; // 選択された値を取得
    const newUserOptions: RouterOutPuts["userTypingOption"]["getUserTypingOptions"] = {
      ...userOptionsAtom,
      toggleInputModeKey: value, // 選択された値を設定
    };
    setUserOptionsAtom(newUserOptions);
  };
  return (
    <Flex>
      <Box>
        <Text fontSize="lg" fontWeight="semibold" mb={2}>
          ショートカットキー設定
        </Text>
        <Flex alignItems="baseline" mb={4}>
          <Text mr={2}>タイミング調整</Text>
          <Select
            onChange={changeTimeOffsetKey}
            width="fit-content"
            defaultValue={userOptionsAtom.timeOffsetKey}
          >
            <option value="ctrl-left-right">Ctrl+←→</option>
            <option value="ctrl-alt-left-right">Ctrl+Alt+←→</option>
            <option value="none">無効化</option>
          </Select>
        </Flex>
        <Flex alignItems="baseline">
          <Text mr={2}>かな⇔ローマ字切り替え</Text>
          <Select
            onChange={changeInputModeKey}
            width="fit-content"
            defaultValue={userOptionsAtom.toggleInputModeKey}
          >
            <option value="alt-kana">Alt+Kana</option>
            <option value="tab">Tab</option>
            <option value="none">無効化</option>
          </Select>
        </Flex>
      </Box>
    </Flex>
  );
};

export default UserShortcutKeyCheckbox;
