"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { CircleIcon } from "lucide-react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

function RadioGroup({ className, ...props }: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return <RadioGroupPrimitive.Root data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />;
}

const radioGroupItemVariants = cva(
  [
    "border-foreground text-primary focus-visible:border-ring focus-visible:ring-ring/50",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    "dark:bg-input/30 aspect-square shrink-0 cursor-pointer rounded-full border shadow-xs",
    "transition-[color,box-shadow] outline-none focus-visible:ring-[3px]",
    "disabled:cursor-not-allowed disabled:opacity-50",
  ],
  {
    variants: {
      size: {
        sm: "size-3",
        md: "size-4.5",
        lg: "size-6",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

const radioGroupIndicatorVariants = cva("fill-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2", {
  variants: {
    size: {
      sm: "size-1.5",
      md: "size-3",
      lg: "size-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

export interface RadioGroupItemProps
  extends React.ComponentProps<typeof RadioGroupPrimitive.Item>,
    VariantProps<typeof radioGroupItemVariants> {}

function RadioGroupItem({ className, size, ...props }: RadioGroupItemProps) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ size }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className={cn(radioGroupIndicatorVariants({ size }))} />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}

const radioCardVariants = cva(
  "cursor-pointer border border-border shadow-md select-none transition-all duration-200 flex items-center justify-center text-center rounded-md",
  {
    variants: {
      variant: {
        default:
          "hover:opacity-90 hover:shadow-lg bg-background text-foreground data-[state=checked]:ring-2 data-[state=checked]:ring-primary/20",
        primary:
          "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-lg",
        secondary:
          "data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground data-[state=checked]:shadow-lg",
        accent:
          "data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground data-[state=checked]:shadow-lg",
        destructive:
          "data-[state=checked]:bg-destructive data-[state=checked]:text-destructive-foreground data-[state=checked]:shadow-lg",
        outline: "data-[state=checked]:border-primary data-[state=checked]:border-2 data-[state=checked]:shadow-lg",
        roma: "data-[state=checked]:bg-roma data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-lg",
        kana: "data-[state=checked]:bg-kana data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-lg",
        english:
          "data-[state=checked]:bg-english data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-lg",
        romakana:
          "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-roma data-[state=checked]:to-kana data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-lg",
        flick:
          "data-[state=checked]:bg-flick data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-lg",
        perfect:
          "data-[state=checked]:bg-perfect data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-lg",
        all: "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-roma data-[state=checked]:via-kana data-[state=checked]:to-english data-[state=checked]:text-primary-foreground data-[state=checked]:shadow-lg",
      },
      size: {
        default: "text-sm px-3 py-2",
        sm: "text-xs py-1.5 min-w-24 px-1",
        lg: "text-base px-4 py-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface RadioCardProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  variant?: VariantProps<typeof radioCardVariants>["variant"];
  size?: VariantProps<typeof radioCardVariants>["size"];
}

const RadioCard = ({ className, variant = "default", size = "default", children, ...props }: RadioCardProps) => {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-card"
      className={cn(radioCardVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
};

const radioButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-background border border-input hover:bg-accent hover:text-accent-foreground data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=checked]:border-primary data-[state=checked]:border-2",
        ghost:
          "hover:bg-accent hover:text-accent-foreground data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface RadioButtonProps extends React.ComponentProps<typeof RadioGroupPrimitive.Item> {
  variant?: VariantProps<typeof radioButtonVariants>["variant"];
  size?: VariantProps<typeof radioButtonVariants>["size"];
}

const RadioButton = ({ className, variant, size, children, ...props }: RadioButtonProps) => {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-button"
      className={cn(radioButtonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </RadioGroupPrimitive.Item>
  );
};

export { RadioButton, radioButtonVariants, RadioCard, radioCardVariants, RadioGroup, RadioGroupItem };
