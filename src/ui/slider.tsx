"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import type * as React from "react";

import { cn } from "@/utils/cn";
import { Badge } from "./badge";

interface SliderProps extends SliderPrimitive.Root.Props<number[]> {
  thumbLabel?: (value: number | undefined) => React.ReactNode;
}

function Slider({
  className,
  defaultValue,
  thumbLabel,
  value,
  min = 0,
  max = 100,
  onValueChange,
  onValueCommitted,
  ...props
}: SliderProps) {
  const _values = Array.isArray(value) ? value : Array.isArray(defaultValue) ? defaultValue : [min, max];

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      onValueChange={(next, eventDetails) => onValueChange?.(toArray(next), eventDetails)}
      onValueCommitted={(next, eventDetails) => onValueCommitted?.(toArray(next), eventDetails)}
      thumbAlignment="edge"
      className={cn("w-full data-disabled:opacity-50", className)}
      {...props}
    >
      <SliderPrimitive.Control
        data-slot="slider-control"
        className="relative flex w-full cursor-grab touch-none select-none items-center data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-44 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col"
      >
        <SliderPrimitive.Track
          data-slot="slider-track"
          className={cn(
            "relative grow overflow-hidden rounded-full bg-muted-foreground/50 data-[orientation=horizontal]:h-1.5 data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-1.5",
          )}
        >
          <SliderPrimitive.Indicator
            data-slot="slider-indicator"
            className={cn(
              "absolute bg-primary data-[orientation=horizontal]:h-full data-[orientation=vertical]:w-full",
            )}
          />
        </SliderPrimitive.Track>
        {Array.from({ length: _values.length }, (_, index) => (
          <SliderPrimitive.Thumb
            data-slot="slider-thumb"
            index={index}
            // biome-ignore lint/suspicious/noArrayIndexKey: 配列の長さ・順序が不変のため安全
            key={index}
            className="block size-4 shrink-0 rounded-full border border-primary bg-foreground shadow-sm ring-ring/50 transition-[color,box-shadow] hover:ring-4 focus-visible:outline-hidden focus-visible:ring-4 data-disabled:pointer-events-none data-disabled:opacity-50"
          >
            <Badge
              variant="outline"
              className="absolute -top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-0 bg-background group-hover:scale-100"
            >
              {thumbLabel ? thumbLabel(_values[index]) : _values[index]}
            </Badge>
          </SliderPrimitive.Thumb>
        ))}
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

const toArray = (value: number | readonly number[]): number[] => (typeof value === "number" ? [value] : [...value]);

export { Slider };
