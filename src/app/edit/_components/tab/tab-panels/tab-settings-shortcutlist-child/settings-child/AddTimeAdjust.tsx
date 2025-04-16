"use client";

import { useSetTimeOffsetState, useTimeOffsetState } from "@/app/edit/atoms/storageAtoms";
import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Box, Button, Flex, Text, useTheme } from "@chakra-ui/react";

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
      label="タイム補正"
    />
  );
}

interface CounterInputProps {
  value: number;
  label: string;
  max: number;
  min: number;
  step: number;
  valueDigits?: number;
  onChange: (value: number) => void;
}

const CounterInput = ({ value, label, max, min, step, valueDigits = 0, onChange }: CounterInputProps) => {
  const theme: ThemeColors = useTheme();

  const onCounterChange = ({ type }: { type: "increment" | "decrement" }) => {
    const newValue = type === "increment" ? Math.min(max, value + step) : Math.max(min, value - step);
    onChange(newValue);
  };

  return (
    <CustomToolTip
      label={
        <>
          <Box>再生中に追加・変更を行う場合に、数値分補正してタイムを記録します。</Box>
          <Box>
            <Text fontSize="xs">
              譜面のタイムは、歌いだしの瞬間より-0.2 ~ -0.25秒程早めに設定すると丁度よいタイミングになります。
            </Text>
            <Text fontSize="xs">
              (譜面のタイムが遅くなってしまうと、決め打ちなどのテクニックが通りづらくなってしまいます。)
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
          <Button onClick={() => onCounterChange({ type: "decrement" })} size="xs" cursor="pointer" variant="unstyled">
            -
          </Button>
          <Flex fontSize="xs" gap={2}>
            {value.toFixed(valueDigits)}
          </Flex>
          <Button
            onClick={() => onCounterChange({ type: "increment" })}
            size="xs"
            cursor="pointer"
            variant="unstyled"
            position="relative"
          >
            +
          </Button>
        </Flex>
      </Flex>
    </CustomToolTip>
  );
};
