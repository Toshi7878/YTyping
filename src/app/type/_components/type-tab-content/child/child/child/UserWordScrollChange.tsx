"use client";
import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Button, Flex, Text, useTheme } from "@chakra-ui/react";

export const UserWordScrollChange = () => {
  const setUserOptionsAtom = useSetUserTypingOptionsState();
  const userOptionsAtom = useUserTypingOptionsState();
  const { writeGameUtils } = useGameUtilsRef();

  const onChangeKana = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(20, userOptionsAtom.kana_word_scroll + 1)
        : Math.max(0, userOptionsAtom.kana_word_scroll - 1);

    const newUserOptions: typeof userOptionsAtom = {
      ...userOptionsAtom,
      kana_word_scroll: newValue,
    };
    setUserOptionsAtom(newUserOptions);
    writeGameUtils({ isOptionEdited: true });
  };

  const onChangeRoma = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(20, userOptionsAtom.roma_word_scroll + 1)
        : Math.max(0, userOptionsAtom.roma_word_scroll - 1);

    const newUserOptions: typeof userOptionsAtom = {
      ...userOptionsAtom,
      roma_word_scroll: newValue,
    };
    setUserOptionsAtom(newUserOptions);
    writeGameUtils({ isOptionEdited: true });
  };

  return (
    <Flex flexDirection="column" gap={4}>
      <Text fontSize="lg" fontWeight="semibold">
        ワードスクロール開始位置 調整
      </Text>
      <KanaWordScrollChange
        onIncrement={() => onChangeKana("increment")}
        onDecrement={() => onChangeKana("decrement")}
        kana_word_scroll={userOptionsAtom.kana_word_scroll}
      />
      <RomaWordScrollChange
        onIncrement={() => onChangeRoma("increment")}
        onDecrement={() => onChangeRoma("decrement")}
        roma_word_scroll={userOptionsAtom.roma_word_scroll}
      />
    </Flex>
  );
};

interface KanaWordScrollChangeProps {
  onIncrement: () => void;
  onDecrement: () => void;
  kana_word_scroll: number;
}

const KanaWordScrollChange = ({ onIncrement, onDecrement, kana_word_scroll }: KanaWordScrollChangeProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Flex alignItems="baseline">
      <Text fontSize="lg" mr={2}>
        かな表示
      </Text>
      <Flex
        alignItems="baseline"
        border="1px"
        borderColor={`${theme.colors.border.card}90`}
        width="fit-content"
        rounded="full"
      >
        <CustomToolTip label={"かな表示スクロールタイミングを減らします"} placement="top">
          <Button onClick={onDecrement} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
            -
          </Button>
        </CustomToolTip>
        <Box fontSize="lg">{kana_word_scroll}</Box>
        <CustomToolTip label={"かな表示スクロールタイミングを増やします"} placement="top">
          <Button onClick={onIncrement} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
            +
          </Button>
        </CustomToolTip>
      </Flex>
    </Flex>
  );
};

interface RomaWordScrollChangeProps {
  onIncrement: () => void;
  onDecrement: () => void;
  roma_word_scroll: number;
}

const RomaWordScrollChange = ({ onIncrement, onDecrement, roma_word_scroll }: RomaWordScrollChangeProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Flex alignItems="baseline">
      <Text fontSize="lg" mr={2}>
        ローマ字
      </Text>
      <Flex
        alignItems="baseline"
        border="1px"
        borderColor={`${theme.colors.border.card}90`}
        width="fit-content"
        rounded="full"
      >
        <CustomToolTip label={"ローマ字表示スクロールタイミングを減らします"} placement="top">
          <Button onClick={onDecrement} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
            -
          </Button>
        </CustomToolTip>
        <Box fontSize="lg">{roma_word_scroll}</Box>
        <CustomToolTip label={"ローマ字表示スクロールタイミングを増やします"} placement="top">
          <Button onClick={onIncrement} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
            +
          </Button>
        </CustomToolTip>
      </Flex>
    </Flex>
  );
};
