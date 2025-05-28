import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { ThemeColors } from "@/types";
import { Button, Flex, Text, useTheme } from "@chakra-ui/react";

interface CounterInputProps {
  value: number;
  label: string;
  incrementTooltip: string;
  decrementTooltip: string;
  unit?: string;
  max: number;
  min: number;
  step: number;
  valueDigits?: number;
  onChange: (value: number) => void;
  size?: "sm" | "md" | "lg";
}

const CounterInput = ({
  value,
  label,
  incrementTooltip,
  decrementTooltip,
  unit,
  max,
  min,
  step,
  valueDigits = 0,
  onChange,
  size = "lg",
}: CounterInputProps) => {
  const theme: ThemeColors = useTheme();

  const onCounterChange = ({ type }: { type: "increment" | "decrement" }) => {
    const newValue = type === "increment" ? Math.min(max, value + step) : Math.max(min, value - step);
    const newValueFixed = Number(newValue.toFixed(valueDigits));
    onChange(newValueFixed);
  };

  return (
    <Flex alignItems="baseline">
      <Text fontSize={size} mr={2}>
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
          <Button
            onClick={() => onCounterChange({ type: "decrement" })}
            cursor="pointer"
            variant="unstyled"
            fontSize="xl"
            position="relative"
            bottom={0.5}
          >
            -
          </Button>
        </CustomToolTip>
        <Flex fontSize={size} gap={1} fontWeight="bold">
          {value.toFixed(valueDigits)}
          {unit && <Text>{unit}</Text>}
        </Flex>
        <CustomToolTip label={incrementTooltip} placement="top">
          <Button
            onClick={() => onCounterChange({ type: "increment" })}
            cursor="pointer"
            variant="unstyled"
            position="relative"
            bottom={0.5}
            fontSize="xl"
          >
            +
          </Button>
        </CustomToolTip>
      </Flex>
    </Flex>
  );
};

export default CounterInput;
