"use client";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { Flex, Text } from "@chakra-ui/react";
import { CounterInput } from "./child/CounterInput";

const MAX_SCROLL = 20;
const MIN_SCROLL = 0;
const SCROLL_STEP = 1;

export const UserWordScrollChange = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { kana_word_scroll, roma_word_scroll } = useUserTypingOptionsState();

  const onChangeKana = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(MAX_SCROLL, kana_word_scroll + SCROLL_STEP)
        : Math.max(MIN_SCROLL, kana_word_scroll - SCROLL_STEP);
    setUserTypingOptions({ kana_word_scroll: newValue });
  };

  const onChangeRoma = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(MAX_SCROLL, roma_word_scroll + SCROLL_STEP)
        : Math.max(MIN_SCROLL, roma_word_scroll - SCROLL_STEP);
    setUserTypingOptions({ roma_word_scroll: newValue });
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
          value={kana_word_scroll}
          label="かな表示"
          incrementTooltip="かな表示スクロールタイミングを増やします。"
          decrementTooltip="かな表示スクロールタイミングを減らします。"
        />
        <CounterInput
          onIncrement={() => onChangeRoma("increment")}
          onDecrement={() => onChangeRoma("decrement")}
          value={roma_word_scroll}
          label="ローマ字"
          incrementTooltip="ローマ字表示スクロールタイミングを増やします。"
          decrementTooltip="ローマ字表示スクロールタイミングを減らします。"
        />
      </Flex>
    </Flex>
  );
};
