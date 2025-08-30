import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from "./button";
import { TooltipWrapper } from "./tooltip";

const counterVariants = cva("", {
  variants: {
    size: {
      sm: "",
      default: "",
      lg: "",
    },
    element: {
      wrapper: "flex flex-col items-center md:flex-row md:items-baseline",
      container: "border-border/50 flex w-fit items-baseline rounded-full border",
      value: "flex items-center gap-1 text-center",
      label: "",
    },
  },
  compoundVariants: [
    // Wrapper
    { size: "sm", element: "wrapper", class: "gap-1" },
    { size: "default", element: "wrapper", class: "gap-2" },
    { size: "lg", element: "wrapper", class: "gap-3" },
    // Container
    { size: "sm", element: "container", class: "px-1" },
    { size: "default", element: "container", class: "px-2" },
    { size: "lg", element: "container", class: "px-3" },
    // Value
    { size: "sm", element: "value", class: "px-1 text-xs" },
    { size: "default", element: "value", class: "px-2 text-xs" },
    { size: "lg", element: "value", class: "px-3 text-sm" },
    // Label
    { size: "sm", element: "label", class: "text-xs" },
    { size: "default", element: "label", class: "text-sm" },
    { size: "lg", element: "label", class: "text-base" },
  ],
  defaultVariants: {
    size: "default",
  },
});

interface CounterInputProps extends VariantProps<typeof counterVariants> {
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
  className?: string;
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
  size = "default",
  className,
}: CounterInputProps) => {
  const onCounterChange = ({ type }: { type: "increment" | "decrement" }) => {
    const newValue = type === "increment" ? Math.min(max, value + step) : Math.max(min, value - step);
    const newValueFixed = Number(newValue.toFixed(valueDigits));
    onChange(newValueFixed);
  };

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "default" : "sm";
  const buttonPadding = size === "sm" ? "p-0.5" : size === "lg" ? "p-2" : "p-1";

  return (
    <div className={cn(counterVariants({ size, element: "wrapper" }), className)}>
      <span className={counterVariants({ size, element: "label" })}>{label}</span>
      <div className={counterVariants({ size, element: "container" })}>
        <TooltipWrapper label={decrementTooltip} disabled={!decrementTooltip}>
          <Button
            onClick={() => onCounterChange({ type: "decrement" })}
            size={buttonSize}
            variant="ghost"
            className={cn("h-auto", buttonPadding)}
          >
            -
          </Button>
        </TooltipWrapper>
        <div className={counterVariants({ size, element: "value" })}>
          {value.toFixed(valueDigits)}
          {unit && <span>{unit}</span>}
        </div>

        <TooltipWrapper label={incrementTooltip} disabled={!incrementTooltip}>
          <Button
            onClick={() => onCounterChange({ type: "increment" })}
            size={buttonSize}
            variant="ghost"
            className={cn("h-auto", buttonPadding)}
          >
            +
          </Button>
        </TooltipWrapper>
      </div>
    </div>
  );
};
