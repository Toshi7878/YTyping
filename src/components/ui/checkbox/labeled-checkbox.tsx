"use client";

import { cn } from "@/lib/utils";
import * as React from "react";
import { Label } from "../label";
import { Checkbox } from "./checkbox";

export interface LabeledCheckboxProps extends Omit<React.ComponentProps<typeof Checkbox>, "onCheckedChange"> {
  label?: React.ReactNode;
  labelClassName?: string;
  containerClassName?: string;
  description?: React.ReactNode;
  error?: string;
  onCheckedChange?: (checked: boolean) => void;
  checked?: boolean;
  defaultChecked?: boolean;
}

const LabeledCheckbox = React.forwardRef<React.ComponentRef<typeof Checkbox>, LabeledCheckboxProps>(
  (
    {
      id,
      label,
      labelClassName,
      containerClassName,
      className,
      description,
      error,
      onCheckedChange,
      checked,
      defaultChecked,
      ...props
    },
    ref,
  ) => {
    const checkboxId = id || React.useId();

    return (
      <div className={cn("space-y-2", containerClassName)}>
        <div className="flex items-start space-x-3">
          <Checkbox
            ref={ref}
            id={checkboxId}
            checked={checked}
            defaultChecked={defaultChecked}
            onCheckedChange={onCheckedChange}
            className={cn(error && "border-destructive aria-invalid:ring-destructive/20", className)}
            {...props}
          />
          {label && (
            <div className="space-y-1 leading-none">
              <Label htmlFor={checkboxId} className={cn("cursor-pointer text-sm font-normal", labelClassName)}>
                {label}
              </Label>
              {description && <p className="text-muted-foreground text-xs">{description}</p>}
            </div>
          )}
        </div>
        {error && <p className="text-destructive ml-7 text-sm">{error}</p>}
      </div>
    );
  },
);

LabeledCheckbox.displayName = "LabeledCheckbox";

export { LabeledCheckbox };
