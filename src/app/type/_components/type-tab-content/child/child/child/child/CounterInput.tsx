import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Button, Flex, Text, useTheme } from "@chakra-ui/react";

interface CounterInputProps {
  onIncrement: () => void;
  onDecrement: () => void;
  value: number | string;
  label: string;
  incrementTooltip: string;
  decrementTooltip: string;
  unit?: string;
}

export const CounterInput = ({
  onIncrement,
  onDecrement,
  value,
  label,
  incrementTooltip,
  decrementTooltip,
  unit,
}: CounterInputProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Flex alignItems="baseline">
      <Text fontSize="lg" mr={2}>
        {label}
      </Text>
      <Flex
        alignItems="baseline"
        border="1px"
        borderColor={`${theme.colors.border.card}90`}
        width="fit-content"
        rounded="full"
        py={0}
        px={2}
      >
        <CustomToolTip label={decrementTooltip} placement="top">
          <Button onClick={onDecrement} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
            -
          </Button>
        </CustomToolTip>
        <Flex fontSize="lg" gap={1}>
          {value}
          {unit && <Text>{unit}</Text>}
        </Flex>
        <CustomToolTip label={incrementTooltip} placement="top">
          <Button onClick={onIncrement} cursor="pointer" variant="unstyled" size="lg" fontSize="xl">
            +
          </Button>
        </CustomToolTip>
      </Flex>
    </Flex>
  );
};
