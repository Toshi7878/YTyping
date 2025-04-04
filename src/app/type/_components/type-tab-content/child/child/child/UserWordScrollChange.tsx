"use client";
import { useGameUtilsRef } from "@/app/type/atoms/refAtoms";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { Flex, Text } from "@chakra-ui/react";
import { CounterInput } from "./child/CounterInput";
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
      <Flex gap={6}>
        <CounterInput
          onIncrement={() => onChangeKana("increment")}
          onDecrement={() => onChangeKana("decrement")}
          value={userOptionsAtom.kana_word_scroll}
          label="かな表示"
          incrementTooltip="かな表示スクロールタイミングを増やします。"
          decrementTooltip="かな表示スクロールタイミングを減らします。"
        />
        <CounterInput
          onIncrement={() => onChangeRoma("increment")}
          onDecrement={() => onChangeRoma("decrement")}
          value={userOptionsAtom.roma_word_scroll}
          label="ローマ字"
          incrementTooltip="ローマ字表示スクロールタイミングを増やします。"
          decrementTooltip="ローマ字表示スクロールタイミングを減らします。"
        />
      </Flex>
    </Flex>
  );
};
