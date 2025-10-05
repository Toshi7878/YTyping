"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  labelPosition?: "top" | "bottom";
  label?: (value: number | undefined) => React.ReactNode;
}

const DualRangeSlider = React.forwardRef<React.ElementRef<typeof SliderPrimitive.Root>, DualRangeSliderProps>(
  ({ className, label, labelPosition = "top", ...props }, ref) => {
    const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max];

    return (
      <SliderPrimitive.Root
        ref={ref}
        className={cn("relative flex w-full cursor-grab touch-none items-center select-none", className)}
        {...props}
      >
        <SliderPrimitive.Track className="bg-muted-foreground/50 relative h-2 w-full grow overflow-hidden rounded-full">
          <SliderPrimitive.Range className="bg-primary absolute h-full" />
        </SliderPrimitive.Track>
        {initialValue.map((value, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <固定長配列なのでindex keyを許可>
          <React.Fragment key={index}>
            <SliderPrimitive.Thumb className="border-primary bg-foreground ring-ring/50 block size-4 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50">
              {label && (
                <span
                  className={cn(
                    "absolute flex w-full justify-center",
                    labelPosition === "top" && "-top-7",
                    labelPosition === "bottom" && "top-4",
                  )}
                >
                  {label(value)}
                </span>
              )}
            </SliderPrimitive.Thumb>
          </React.Fragment>
        ))}
      </SliderPrimitive.Root>
    );
  },
);
DualRangeSlider.displayName = "DualRangeSlider";

export { DualRangeSlider };
