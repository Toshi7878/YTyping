"use client";

import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";
import { Label } from "../label";
import { Checkbox } from "./checkbox";

export interface LabeledCheckboxProps extends ComponentProps<typeof Checkbox> {
  label: ReactNode;
}

const LabeledCheckbox = ({ label, ...props }: LabeledCheckboxProps) => {
  return (
    <div className="flex items-center gap-1">
      <Label className={cn("cursor-pointer text-sm font-normal")}>
        <Checkbox {...props} />
        {label}
      </Label>
    </div>
  );
};

export { LabeledCheckbox };
