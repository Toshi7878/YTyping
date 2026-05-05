import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/tailwind";
import { Checkbox } from "./checkbox/checkbox";
import { Label } from "./label";

interface LabeledCheckboxProps extends ComponentProps<typeof Checkbox> {
  label: ReactNode;
  containerClassName?: string;
}

export const LabeledCheckbox = ({ label, containerClassName, ...props }: LabeledCheckboxProps) => {
  return (
    <div className={cn("flex items-center gap-1", containerClassName)}>
      <Label className="cursor-pointer">
        <Checkbox {...props} />
        {label}
      </Label>
    </div>
  );
};
