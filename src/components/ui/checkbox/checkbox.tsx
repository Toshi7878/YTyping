"use client";

import { CheckIcon } from "lucide-react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "../label";
import { TooltipWrapper } from "../tooltip";

function Checkbox({ className, ...props }: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer border-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground dark:data-[state=checked]:bg-primary data-[state=checked]:border-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive size-4 shrink-0 cursor-pointer rounded-[4px] border shadow-xs transition-shadow outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

const CheckboxListItem = ({
  label,
  tooltip,
  defaultChecked,
  ...props
}: Omit<React.ComponentProps<typeof Checkbox>, "id" | "defaultChecked"> & {
  label: string;
  tooltip?: string;
  defaultChecked: boolean;
}) => {
  const isChanged = defaultChecked !== props.checked;

  const content = (
    <Label
      className={cn(
        "hover:bg-accent/50 flex items-start px-3 py-4 has-aria-checked:border-primary",
        props.disabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <Checkbox
        {...props}
        className="data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
      />
      {label}
    </Label>
  );

  return (
    <div className={cn("border-l-4", isChanged ? "border-primary" : "border-muted")}>
      {tooltip ? (
        <TooltipWrapper label={tooltip} align="start">
          {content}
        </TooltipWrapper>
      ) : (
        content
      )}
    </div>
  );
};

interface CheckboxCardGroupProps {
  items: {
    label: string;
    defaultChecked: boolean;
    checked: boolean;
    onCheckedChange: (checked: boolean) => void;
    tooltip?: string;
  }[];
}
const CheckboxCardGroup = ({
  items,
  ...props
}: CheckboxCardGroupProps & Omit<React.ComponentProps<typeof Checkbox>, "id" | "defaultChecked">) => {
  return (
    <div>
      {items.map((item) => (
        <CheckboxListItem key={item.label} {...item} {...props} />
      ))}
    </div>
  );
};

export { Checkbox, CheckboxListItem, CheckboxCardGroup };
