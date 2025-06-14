import CustomToolTip from "@/components/custom-ui/CustomToolTip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
  const onCounterChange = ({ type }: { type: "increment" | "decrement" }) => {
    const newValue = type === "increment" ? Math.min(max, value + step) : Math.max(min, value - step);
    const newValueFixed = Number(newValue.toFixed(valueDigits));
    onChange(newValueFixed);
  };

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  return (
    <div className="flex items-baseline">
      <span className={cn(sizeClasses[size], "mr-2")}>
        {label}
      </span>
      <div className="flex items-baseline border border-border/60 w-fit rounded-full py-0 px-2">
        <CustomToolTip label={decrementTooltip} placement="top">
          <Button
            onClick={() => onCounterChange({ type: "decrement" })}
            variant="ghost"
            className="h-auto p-0 text-xl relative -bottom-0.5 hover:bg-transparent"
          >
            -
          </Button>
        </CustomToolTip>
        <div className={cn(sizeClasses[size], "flex gap-1 font-bold")}>
          {value.toFixed(valueDigits)}
          {unit && <span>{unit}</span>}
        </div>
        <CustomToolTip label={incrementTooltip} placement="top">
          <Button
            onClick={() => onCounterChange({ type: "increment" })}
            variant="ghost"
            className="h-auto p-0 text-xl relative -bottom-0.5 hover:bg-transparent"
          >
            +
          </Button>
        </CustomToolTip>
      </div>
    </div>
  );
};

export default CounterInput;
