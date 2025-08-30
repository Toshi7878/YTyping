import { Button } from "./button";
import { TooltipWrapper } from "./tooltip";

interface CounterInputProps {
  value: number;
  label: string;
  max: number;
  min: number;
  step: number;
  valueDigits?: number;
  onChange: (value: number) => void;
  unit?: string;
  decrementTooltip?: string;
  incrementTooltip?: string;
}

export const CounterInput = ({
  value,
  label,
  max,
  min,
  step,
  valueDigits = 0,
  onChange,
  unit,
  decrementTooltip,
  incrementTooltip,
}: CounterInputProps) => {
  const onCounterChange = ({ type }: { type: "increment" | "decrement" }) => {
    const newValue = type === "increment" ? Math.min(max, value + step) : Math.max(min, value - step);
    const newValueFixed = Number(newValue.toFixed(valueDigits));
    onChange(newValueFixed);
  };

  return (
    <div className="flex flex-col items-center gap-2 md:flex-row md:items-baseline">
      <span className="text-sm">{label}</span>
      <div className="border-border/50 flex w-fit items-baseline rounded-full border px-2">
        <TooltipWrapper label={decrementTooltip} disabled={!decrementTooltip}>
          <Button
            onClick={() => onCounterChange({ type: "decrement" })}
            size="sm"
            variant="ghost"
            className="h-auto p-1"
          >
            -
          </Button>
        </TooltipWrapper>
        <div className="flex items-center gap-1 px-2 text-xs">
          {value.toFixed(valueDigits)}
          {unit && <span>{unit}</span>}
        </div>

        <TooltipWrapper label={incrementTooltip} disabled={!incrementTooltip}>
          <Button
            onClick={() => onCounterChange({ type: "increment" })}
            size="sm"
            variant="ghost"
            className="h-auto p-1"
          >
            +
          </Button>
        </TooltipWrapper>
      </div>
    </div>
  );
};
