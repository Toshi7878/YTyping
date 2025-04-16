"use client";

import { useSetTimeOffsetState, useTimeOffsetState } from "@/app/edit/atoms/storageAtoms";

const MAX_TIME_OFFSET = -0.1;
const MIN_TIME_OFFSET = -0.4;
const TIME_OFFSET_STEP = 0.01;

export default function AddTimeAdjust() {
  const timeOffset = useTimeOffsetState();
  const setTimeOffset = useSetTimeOffsetState();

  return (
    <CounterInput
      value={timeOffset}
      onChange={(value) => setTimeOffset(value)}
      step={TIME_OFFSET_STEP}
      max={MAX_TIME_OFFSET}
      min={MIN_TIME_OFFSET}
      valueDigits={2}
      decrementTooltip="タイミングが早くなります"
      incrementTooltip="タイミングが遅くなります"
      label="タイム補正"
    />
  );
}

import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Button, Flex, Text, useTheme } from "@chakra-ui/react";

interface CounterInputProps {
  value: number;
  label: string;
  incrementTooltip: string;
  decrementTooltip: string;
  max: number;
  min: number;
  step: number;
  valueDigits?: number;
  onChange: (value: number) => void;
}

const CounterInput = ({
  value,
  label,
  incrementTooltip,
  decrementTooltip,
  max,
  min,
  step,
  valueDigits = 0,
  onChange,
}: CounterInputProps) => {
  const theme: ThemeColors = useTheme();

  const onCounterChange = ({ type }: { type: "increment" | "decrement" }) => {
    const newValue = type === "increment" ? Math.min(max, value + step) : Math.max(min, value - step);
    onChange(newValue);
  };

  return (
    <CustomToolTip
      label={
        <>
          <Box>再生中に追加・変更ボタンを押した時に、数値分タイムを補正します</Box>
          <Box>
            <Text fontSize="xs">
              譜面のタイムは、歌いだしの瞬間より-0.2 ~ -0.25秒程早めに設定すると丁度よいタイミングになります。
            </Text>
            <Text fontSize="xs">※間奏など、追加時にワードが存在しない場合は追加タイム補正は適用されません。</Text>
          </Box>
        </>
      }
      placement="top"
    >
      <Flex alignItems="baseline">
        <Text fontSize="sm" mr={2}>
          {label}
        </Text>
        <Flex
          alignItems="baseline"
          border="1px"
          borderColor={`${theme.colors.border.card}90`}
          width="fit-content"
          rounded="full"
          px={2}
        >
          <CustomToolTip label={decrementTooltip} placement="top">
            <Button
              onClick={() => onCounterChange({ type: "decrement" })}
              size="xs"
              cursor="pointer"
              variant="unstyled"
            >
              -
            </Button>
          </CustomToolTip>
          <Flex fontSize="xs" gap={2}>
            {value.toFixed(valueDigits)}
          </Flex>
          <CustomToolTip label={incrementTooltip} placement="top">
            <Button
              onClick={() => onCounterChange({ type: "increment" })}
              size="xs"
              cursor="pointer"
              variant="unstyled"
              position="relative"
            >
              +
            </Button>
          </CustomToolTip>
        </Flex>
      </Flex>
    </CustomToolTip>
  );
};
