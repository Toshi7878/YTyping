"use client";
import { useSetUserTypingOptionsState, useUserTypingOptionsState } from "@/app/(typing)/type/atoms/stateAtoms";
import { Button, Flex, Text } from "@chakra-ui/react";
import { MdRestartAlt } from "react-icons/md";
import CounterInput from "./child/CounterInput";

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
          onChange={(value) => setUserTypingOptions({ kana_word_font_size: value })}
          step={FONT_SIZE_STEP}
          max={MAX_FONT_SIZE}
          min={MIN_FONT_SIZE}
          value={kana_word_font_size}
          label="かな表示"
          incrementTooltip="かな表示フォントサイズを大きくします。"
          decrementTooltip="かな表示フォントサイズを小さくします。"
          unit="%"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_font_size: value })}
          step={FONT_SIZE_STEP}
          max={MAX_FONT_SIZE}
          min={MIN_FONT_SIZE}
          value={roma_word_font_size}
          label="ローマ字"
          incrementTooltip="ローマ字表示フォントサイズを大きくします。"
          decrementTooltip="ローマ字表示フォントサイズを小さくします。"
          unit="%"
        />
      </Flex>
      <Flex gap={6}>
        <CounterInput
          onChange={(value) => setUserTypingOptions({ kana_word_top_position: value })}
          step={TOP_POSITION_STEP}
          max={MAX_TOP_POSITION}
          min={MIN_TOP_POSITION}
          value={kana_word_top_position}
          valueDigits={1}
          label="かな表示"
          incrementTooltip="かな表示を上に移動します。"
          decrementTooltip="かな表示を下に移動します。"
          unit="px"
        />
        <CounterInput
          onChange={(value) => setUserTypingOptions({ roma_word_top_position: value })}
          step={TOP_POSITION_STEP}
          max={MAX_TOP_POSITION}
          min={MIN_TOP_POSITION}
          value={roma_word_top_position}
          valueDigits={1}
          label="ローマ字"
          incrementTooltip="ローマ字表示を上に移動します。"
          decrementTooltip="ローマ字表示を下に移動します。"
          unit="px"
        />
      </Flex>
    </Flex>
  );
};
