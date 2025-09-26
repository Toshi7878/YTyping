import { cva, type VariantProps } from "class-variance-authority"
import { useHotkeys } from "react-hotkeys-hook"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { TooltipWrapper } from "./tooltip"

const counterVariants = cva("", {
  variants: {
    variant: {
      default: "",
      outline: "",
      filled: "",
      minimal: "",
    },
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
      button: "",
    },
  },
  compoundVariants: [
    // Wrapper
    { size: "sm", element: "wrapper", class: "gap-1" },
    { size: "default", element: "wrapper", class: "gap-2" },
    { size: "lg", element: "wrapper", class: "gap-3" },

    // Container - Default variant
    { variant: "default", element: "container", class: "bg-transparent border-border/50" },
    { variant: "outline", element: "container", class: "bg-transparent border-2 border-border" },
    { variant: "filled", element: "container", class: "bg-muted border-transparent" },
    { variant: "minimal", element: "container", class: "bg-transparent border-transparent" },

    // Container sizing
    { size: "sm", element: "container", class: "px-1" },
    { size: "default", element: "container", class: "px-2" },
    { size: "lg", element: "container", class: "px-3" },

    // Value
    { size: "sm", element: "value", class: "px-1 text-xs" },
    { size: "default", element: "value", class: "px-2 text-md" },
    { size: "lg", element: "value", class: "px-3 text-md" },

    // Label
    { size: "sm", element: "label", class: "text-sm" },
    { size: "default", element: "label", class: "text-md" },
    { size: "lg", element: "label", class: "text-md" },

    // Button - variant specific styles
    { variant: "default", element: "button", class: "hover:bg-accent" },
    { variant: "outline", element: "button", class: "hover:bg-accent" },
    { variant: "filled", element: "button", class: "hover:bg-background/80" },
    { variant: "minimal", element: "button", class: "hover:bg-muted" },

    // Button sizing
    { size: "sm", element: "button", class: "p-0.5 w-6 text-sm" },
    { size: "default", element: "button", class: "p-1 w-6 text-md" },
    { size: "lg", element: "button", class: "w-8 text-lg" },
  ],
  defaultVariants: {
    variant: "outline",
    size: "default",
  },
})

interface CounterInputProps extends VariantProps<typeof counterVariants> {
  value: number
  label?: string
  max: number
  min: number
  step: number
  valueDigits?: number
  onChange: (value: number) => void
  unit?: string
  decrementTooltip?: string
  incrementTooltip?: string
  className?: string
  minusButtonHotkey?: string
  plusButtonHotkey?: string
}

export const CounterInput = ({
  value,
  label,
  max,
  min,
  step,
  valueDigits,
  onChange,
  unit,
  decrementTooltip,
  incrementTooltip,
  variant = "default",
  size = "default",
  className,
  minusButtonHotkey = "",
  plusButtonHotkey = "",
}: CounterInputProps) => {
  useHotkeys(minusButtonHotkey, () => onCounterChange({ type: "decrement" }), {
    enableOnFormTags: false,
    preventDefault: true,
  })
  useHotkeys(plusButtonHotkey, () => onCounterChange({ type: "increment" }), {
    enableOnFormTags: false,
    preventDefault: true,
  })

  const onCounterChange = ({ type }: { type: "increment" | "decrement" }) => {
    const newValue = type === "increment" ? Math.min(max, value + step) : Math.max(min, value - step)
    const newValueFixed = valueDigits ? Number(newValue.toFixed(valueDigits)) : newValue
    onChange(newValueFixed)
  }

  const buttonSize = size === "sm" ? "sm" : size === "lg" ? "default" : "sm"

  return (
    <div className={cn(counterVariants({ variant, size, element: "wrapper" }), className)}>
      {label && <span className={counterVariants({ variant, size, element: "label" })}>{label}</span>}
      <div className={counterVariants({ variant, size, element: "container" })}>
        <TooltipWrapper label={decrementTooltip} disabled={!decrementTooltip}>
          <Button
            onClick={() => onCounterChange({ type: "decrement" })}
            size={buttonSize}
            variant="ghost"
            className={cn("h-auto", counterVariants({ variant, size, element: "button" }))}
            type="button"
            disabled={value === min}
          >
            <div className="relative">
              -
              {minusButtonHotkey && (
                <small className="absolute -top-[0.9em] left-1/2 -translate-x-1/2 text-[65%]">
                  {minusButtonHotkey.toUpperCase()}
                </small>
              )}
            </div>
          </Button>
        </TooltipWrapper>
        <div className={counterVariants({ variant, size, element: "value" })}>
          {valueDigits ? value.toFixed(valueDigits) : value}
          {unit && <span>{unit}</span>}
        </div>

        <TooltipWrapper label={incrementTooltip} disabled={!incrementTooltip}>
          <Button
            onClick={() => onCounterChange({ type: "increment" })}
            size={buttonSize}
            variant="ghost"
            className={cn("h-auto", counterVariants({ variant, size, element: "button" }))}
            type="button"
            disabled={value === max}
          >
            <div className="relative">
              +
              {plusButtonHotkey && (
                <small className="absolute -top-[0.9em] left-1/2 -translate-x-1/2 text-[65%]">
                  {plusButtonHotkey.toUpperCase()}
                </small>
              )}
            </div>
          </Button>
        </TooltipWrapper>
      </div>
    </div>
  )
}
