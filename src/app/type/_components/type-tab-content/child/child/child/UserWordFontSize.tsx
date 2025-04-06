"use client";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/type/atoms/stateAtoms";
import { Button, Flex, Text } from "@chakra-ui/react";
import { MdRestartAlt } from "react-icons/md";
import { CounterInput } from "./child/CounterInput";

const FONT_SIZE_STEP = 1;
const TOP_POSITION_STEP = 0.5;
const DEFAULT_FONT_SIZE = 100;
const DEFAULT_TOP_POSITION = 0;

const MAX_FONT_SIZE = 120;
const MIN_FONT_SIZE = 80;
const MAX_TOP_POSITION = 5;
const MIN_TOP_POSITION = -5;

export const UserWordFontSize = () => {
  const { setUserTypingOptions } = useSetUserTypingOptionsState();
  const { kana_word_font_size, roma_word_font_size, kana_word_top_position, roma_word_top_position } =
    useUserTypingOptionsState();

  const onChangeKanaFontSize = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(MAX_FONT_SIZE, kana_word_font_size + FONT_SIZE_STEP)
        : Math.max(MIN_FONT_SIZE, kana_word_font_size - FONT_SIZE_STEP);

    setUserTypingOptions({ kana_word_font_size: newValue });
  };

  const onChangeRomaFontSize = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(MAX_FONT_SIZE, roma_word_font_size + FONT_SIZE_STEP)
        : Math.max(MIN_FONT_SIZE, roma_word_font_size - FONT_SIZE_STEP);

    setUserTypingOptions({ roma_word_font_size: newValue });
  };

  const onChangeKanaTopPosition = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(MAX_TOP_POSITION, kana_word_top_position + TOP_POSITION_STEP)
        : Math.max(MIN_TOP_POSITION, kana_word_top_position - TOP_POSITION_STEP);

    setUserTypingOptions({ kana_word_top_position: newValue });
  };

  const onChangeRomaTopPosition = (type: "increment" | "decrement") => {
    const newValue =
      type === "increment"
        ? Math.min(MAX_TOP_POSITION, roma_word_top_position + TOP_POSITION_STEP)
        : Math.max(MIN_TOP_POSITION, roma_word_top_position - TOP_POSITION_STEP);

    setUserTypingOptions({ roma_word_top_position: newValue });
  };

  const resetToDefaults = () => {
    setUserTypingOptions({
      kana_word_font_size: DEFAULT_FONT_SIZE,
      roma_word_font_size: DEFAULT_FONT_SIZE,
      kana_word_top_position: DEFAULT_TOP_POSITION,
      roma_word_top_position: DEFAULT_TOP_POSITION,
    });
  };

  return (
    <Flex flexDirection="column" gap={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Text fontSize="lg" fontWeight="semibold">
          ワードフォントサイズ 調整
        </Text>
        <Button leftIcon={<MdRestartAlt />} size="sm" colorScheme="blue" variant="outline" onClick={resetToDefaults}>
          リセット
        </Button>
      </Flex>
      <Flex gap={6}>
        <CounterInput
          onIncrement={() => onChangeKanaFontSize("increment")}
          onDecrement={() => onChangeKanaFontSize("decrement")}
          value={kana_word_font_size}
          label="かな表示"
          incrementTooltip="かな表示フォントサイズを大きくします。"
          decrementTooltip="かな表示フォントサイズを小さくします。"
          unit="%"
        />
        <CounterInput
          onIncrement={() => onChangeRomaFontSize("increment")}
          onDecrement={() => onChangeRomaFontSize("decrement")}
          value={roma_word_font_size}
          label="ローマ字"
          incrementTooltip="ローマ字表示フォントサイズを大きくします。"
          decrementTooltip="ローマ字表示フォントサイズを小さくします。"
          unit="%"
        />
      </Flex>
      <Flex gap={6}>
        <CounterInput
          onIncrement={() => onChangeKanaTopPosition("increment")}
          onDecrement={() => onChangeKanaTopPosition("decrement")}
          value={kana_word_top_position}
          label="かな表示"
          incrementTooltip="かな表示を上に移動します。"
          decrementTooltip="かな表示を下に移動します。"
          unit="px"
        />
        <CounterInput
          onIncrement={() => onChangeRomaTopPosition("increment")}
          onDecrement={() => onChangeRomaTopPosition("decrement")}
          value={roma_word_top_position}
          label="ローマ字"
          incrementTooltip="ローマ字表示を上に移動します。"
          decrementTooltip="ローマ字表示を下に移動します。"
          unit="px"
        />
      </Flex>
    </Flex>
  );
};
