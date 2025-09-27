import type * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "../label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

export interface LabeledSelectProps extends React.ComponentProps<typeof Select> {
  label: React.ReactNode;
  options: {
    label: string;
    value: string;
  }[];
}

const LabeledSelect = ({ label, options, ...props }: LabeledSelectProps) => {
  return (
    <div className="flex flex-col gap-1">
      <Label className={cn("text-sm font-normal")}>{label}</Label>
      <Select {...props}>
        <SelectTrigger className="w-fit">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option: { label: string; value: string }) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export { LabeledSelect };
