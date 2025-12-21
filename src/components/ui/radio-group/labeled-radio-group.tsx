"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "../label";
import { RadioGroup, RadioGroupItem } from "./radio-group";

interface LabeledRadioItemProps extends Omit<React.ComponentProps<typeof RadioGroupItem>, "onCheckedChange"> {
  label: React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
  description?: React.ReactNode;
  error?: string;
  value: string;
}

const LabeledRadioItem = ({
  id,
  label,
  labelClassName,
  containerClassName,
  className,
  description,
  error,
  value,
  ref,
  ...props
}: LabeledRadioItemProps) => {
  const radioId = React.useId();

  return (
    <div className={cn("space-y-2", containerClassName)}>
      <div className="flex items-center space-x-2">
        <Label
          htmlFor={radioId}
          className={cn(
            "cursor-pointer font-medium text-sm peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
            labelClassName,
          )}
        >
          <RadioGroupItem
            ref={ref}
            id={radioId}
            value={value}
            className={cn(error && "border-destructive aria-invalid:ring-destructive/20", className)}
            {...props}
          />

          {label}
        </Label>
      </div>
      {description && <p className="ml-6 text-muted-foreground text-xs">{description}</p>}
      {error && <p className="ml-6 text-destructive text-sm">{error}</p>}
    </div>
  );
};

interface LabeledRadioGroupProps extends React.ComponentProps<typeof RadioGroup> {
  items: { label: string; value: string }[];
  label?: React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
  description?: React.ReactNode;
  error?: string;
}

const LabeledRadioGroup = ({
  label,
  labelClassName,
  containerClassName,
  className,
  description,
  error,
  items,
  ref,
  ...props
}: LabeledRadioGroupProps & { ref?: React.Ref<React.ComponentRef<typeof RadioGroup>> }) => {
  return (
    <div className={cn("space-y-3", containerClassName)}>
      {label && <Label className={cn("font-medium text-sm", labelClassName)}>{label}</Label>}
      {description && <p className="text-muted-foreground text-xs">{description}</p>}
      <RadioGroup ref={ref} className={cn(error && "border-destructive", className)} {...props}>
        {items.map((item) => (
          <LabeledRadioItem key={item.value} label={item.label} value={item.value} />
        ))}
      </RadioGroup>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
};

export { LabeledRadioGroup, LabeledRadioItem };
