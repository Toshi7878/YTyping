"use client";
import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { Flex, Text } from "@chakra-ui/react";
import { CounterInput } from "./child/CounterInput";
export const UserWordFontSize = () => {
  const setUserOptionsAtom = useSetUserTypingOptionsState();
  const userOptionsAtom = useUserTypingOptionsState();
  const { writeGameUtils } = useGameUtilsRef();

  const onChangeKana = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(130, userOptionsAtom.kana_word_font_size + 1)
        : Math.max(90, userOptionsAtom.kana_word_font_size - 1);

    const newUserOptions: typeof userOptionsAtom = {
      ...userOptionsAtom,
      kana_word_font_size: newValue,
    };
    setUserOptionsAtom(newUserOptions);
    writeGameUtils({ isOptionEdited: true });
  };

  const onChangeRoma = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(130, userOptionsAtom.roma_word_font_size + 1)
        : Math.max(90, userOptionsAtom.roma_word_font_size - 1);

    const newUserOptions: typeof userOptionsAtom = {
      ...userOptionsAtom,
      roma_word_font_size: newValue,
    };
    setUserOptionsAtom(newUserOptions);
    writeGameUtils({ isOptionEdited: true });
  };

  return (
    <Flex flexDirection="column" gap={4}>
      <Text fontSize="lg" fontWeight="semibold">
        ワードフォントサイズ 調整
      </Text>
      <Flex gap={6}>
        <CounterInput
          onIncrement={() => onChangeKana("increment")}
          onDecrement={() => onChangeKana("decrement")}
          value={userOptionsAtom.kana_word_font_size}
          label="かな表示"
          incrementTooltip="かな表示フォントサイズを大きくします。"
          decrementTooltip="かな表示フォントサイズを小さくします。"
          unit="%"
        />
        <CounterInput
          onIncrement={() => onChangeRoma("increment")}
          onDecrement={() => onChangeRoma("decrement")}
          value={userOptionsAtom.roma_word_font_size}
          label="ローマ字"
          incrementTooltip="ローマ字表示フォントサイズを大きくします。"
          decrementTooltip="ローマ字表示フォントサイズを小さくします。"
          unit="%"
        />
      </Flex>
    </Flex>
  );
};
