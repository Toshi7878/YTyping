"use client";
import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { CHANGE_TIME_OFFSET_VALUE } from "@/app/type/ts/const/consts";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Button, Flex, Text, useTheme } from "@chakra-ui/react";

const UserTimeOffsetChange = () => {
  const theme: ThemeColors = useTheme();
  const setUserOptionsAtom = useSetUserTypingOptionsState();
  const userOptionsAtom = useUserTypingOptionsState();
  const { writeGameUtils } = useGameUtilsRef();

  const decrement = () => {
    const newValue = Math.round((userOptionsAtom.time_offset - CHANGE_TIME_OFFSET_VALUE) * 100) / 100;
    const newUserOptions = {
      ...userOptionsAtom,
      time_offset: Math.max(-1, newValue),
    };
    setUserOptionsAtom(newUserOptions);
    writeGameUtils({ isOptionEdited: true });
  };
  const increment = () => {
    const newValue = Math.round((userOptionsAtom.time_offset + CHANGE_TIME_OFFSET_VALUE) * 100) / 100;
    const newUserOptions = {
      ...userOptionsAtom,
      time_offset: Math.min(1, newValue),
    };

    setUserOptionsAtom(newUserOptions);
    writeGameUtils({ isOptionEdited: true });
  };

  return (
    <Flex alignItems="baseline">
      <Text fontSize="lg" fontWeight="semibold" mr={2}>
        全体タイミング調整
      </Text>
      <Flex
        alignItems="baseline"
        border="1px"
        borderColor={`${theme.colors.border.card}90`}
        width="fit-content"
        rounded={"full"}
      >
        <CustomToolTip label={"タイミングが早くなります"} placement="top">
          <Button onClick={decrement} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
            -
          </Button>
        </CustomToolTip>
        <Box fontSize="lg">{userOptionsAtom.time_offset.toFixed(2)}</Box>
        <CustomToolTip label={"タイミングが遅くなります"} placement="top">
          <Button onClick={increment} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
            +
          </Button>
        </CustomToolTip>
      </Flex>
    </Flex>
  );
};

export default UserTimeOffsetChange;
