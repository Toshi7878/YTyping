"use client";

import { Slider as SliderPrimitive } from "radix-ui";
import * as React from "react";

import { cn } from "@/lib/utils";

interface DualRangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  labelPosition?: "top" | "bottom";
  label?: (value: number | undefined) => React.ReactNode;
}

const DualRangeSlider = ({
  className,
  label,
  labelPosition = "top",
  ref,
  ...props
}: DualRangeSliderProps & { ref?: React.Ref<React.ComponentRef<typeof SliderPrimitive.Root>> }) => {
  const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max];

  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn("relative flex w-full cursor-grab touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted-foreground/50">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      {initialValue.map((value, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: <固定長配列なのでindex keyを許可>
        <React.Fragment key={index}>
          <SliderPrimitive.Thumb className="block size-4 shrink-0 rounded-full border border-primary bg-foreground shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-50">
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
};

export { DualRangeSlider };
