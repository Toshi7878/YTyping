"use client";
import "@/app/edit/style/editor.scss";
import { CHANGE_TIME_OFFSET_VALUE } from "@/app/type/ts/const/typeDefaultValue";
import {
  useSetIsOptionEdited,
  useSetUserOptionsAtom,
  useUserOptionsAtom,
} from "@/app/type/type-atoms/gameRenderAtoms";
import { ThemeColors } from "@/types";
import { Box, Button, Flex, Text, useTheme } from "@chakra-ui/react";

const UserTimeOffsetChange = () => {
  const theme: ThemeColors = useTheme();
  const setUserOptionsAtom = useSetUserOptionsAtom();
  const userOptionsAtom = useUserOptionsAtom();
  const setIsOptionEdited = useSetIsOptionEdited();

  const decrement = () => {
    const newUserOptions = {
      ...userOptionsAtom,
      timeOffset: Math.round((userOptionsAtom.timeOffset - CHANGE_TIME_OFFSET_VALUE) * 100) / 100,
    };
    setUserOptionsAtom(newUserOptions);
    setIsOptionEdited(true);
  };
  const increment = () => {
    const newUserOptions = {
      ...userOptionsAtom,
      timeOffset: Math.round((userOptionsAtom.timeOffset + CHANGE_TIME_OFFSET_VALUE) * 100) / 100,
    };

    setUserOptionsAtom(newUserOptions);
    setIsOptionEdited(true);
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
        fontSize="md"
      >
        <Button onClick={decrement} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
          -
        </Button>
        <Box fontSize="lg">{userOptionsAtom.timeOffset.toFixed(2)}</Box>
        <Button onClick={increment} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
          +
        </Button>
      </Flex>
    </Flex>
  );
};

export default UserTimeOffsetChange;
