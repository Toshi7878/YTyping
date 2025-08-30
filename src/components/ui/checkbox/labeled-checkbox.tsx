"use client";

import { cn } from "@/lib/utils";
import { Label } from "../label";
import { Checkbox } from "./checkbox";

export interface LabeledCheckboxProps extends React.ComponentProps<typeof Checkbox> {
  label: React.ReactNode;
}

const LabeledCheckbox = ({ label, ...props }) => {
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
