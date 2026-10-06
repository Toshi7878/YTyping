"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import * as React from "react";

import { cn } from "@/utils/cn";

interface DualRangeSliderProps extends SliderPrimitive.Root.Props<number[]> {
  labelPosition?: "top" | "bottom";
  label?: (value: number | undefined) => React.ReactNode;
}

const DualRangeSlider = ({
  className,
  label,
  labelPosition = "top",
  ref,
  ...props
}: DualRangeSliderProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const initialValue = Array.isArray(props.value) ? props.value : [props.min, props.max];

  return (
    <SliderPrimitive.Root ref={ref} thumbAlignment="edge" className={className} {...props}>
      <SliderPrimitive.Control className="relative flex w-full cursor-grab touch-none select-none items-center">
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-muted-foreground/50">
          <SliderPrimitive.Indicator className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        {initialValue.map((value, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: 配列の長さ・順序が不変のため安全
          <React.Fragment key={index}>
            <SliderPrimitive.Thumb
              index={index}
              className="block size-4 shrink-0 rounded-full border border-primary bg-foreground shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 data-disabled:pointer-events-none data-disabled:opacity-50"
            >
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
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
};

export { DualRangeSlider };
