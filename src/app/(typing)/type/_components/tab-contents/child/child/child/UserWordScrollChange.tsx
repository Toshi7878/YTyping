"use client";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Flex, Text } from "@chakra-ui/react";
import CounterInput from "./child/CounterInput";

const MAX_SCROLL = 20;
const MIN_SCROLL = 0;
const SCROLL_STEP = 1;

export const UserWordScrollChange = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { kana_word_scroll, roma_word_scroll } = useUserTypingOptionsState();

  return (
    <Flex flexDirection="column" gap={4}>
      <Text fontSize="lg" fontWeight="semibold">
        ワードスクロール開始位置 調整
      </Text>
      <Flex gap={6}>
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kana_word_scroll: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={kana_word_scroll}
          label="かな表示"
          incrementTooltip="かな表示スクロールタイミングを増やします。"
          decrementTooltip="かな表示スクロールタイミングを減らします。"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_scroll: value })}
          step={SCROLL_STEP}
          max={MAX_SCROLL}
          min={MIN_SCROLL}
          value={roma_word_scroll}
          label="ローマ字"
          incrementTooltip="ローマ字表示スクロールタイミングを増やします。"
          decrementTooltip="ローマ字表示スクロールタイミングを減らします。"
        />
      </Flex>
    </Flex>
  );
};
