"use client";

import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";
import { cva, type VariantProps } from "class-variance-authority";
import { CircleIcon } from "lucide-react";

import { cn } from "@/utils/cn";
import { buttonVariants } from "../button";

function RadioGroup<Value = unknown>({ className, ...props }: RadioGroupPrimitive.Props<Value>) {
  return <RadioGroupPrimitive data-slot="radio-group" className={cn("grid gap-3", className)} {...props} />;
}

const radioGroupItemVariants = cva(
  [
    "border-foreground text-primary focus-visible:border-ring focus-visible:ring-ring/50",
    "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
    "dark:bg-input/30 aspect-square shrink-0 cursor-pointer rounded-full border shadow-xs",
    "transition-[color,box-shadow] outline-none focus-visible:ring-[3px]",
    "data-disabled:cursor-not-allowed data-disabled:opacity-50",
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

interface RadioGroupItemProps<Value = unknown>
  extends RadioPrimitive.Root.Props<Value>,
    VariantProps<typeof radioGroupItemVariants> {}

function RadioGroupItem<Value = unknown>({ className, size, ...props }: RadioGroupItemProps<Value>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(radioGroupItemVariants({ size }), className)}
      {...props}
    >
      <RadioPrimitive.Indicator data-slot="radio-group-indicator" className="relative flex items-center justify-center">
        <CircleIcon className={cn(radioGroupIndicatorVariants({ size }))} />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

const radioCardVariants = cva(
  "cursor-pointer border border-border shadow-md select-none transition-all duration-200 flex items-center justify-center text-center rounded-md",
  {
    variants: {
      variant: {
        default:
          "hover:opacity-90 hover:shadow-lg bg-background text-foreground data-checked:ring-2 data-checked:ring-primary/20",
        primary: "data-checked:bg-primary data-checked:text-primary-foreground data-checked:shadow-lg",
        secondary: "data-checked:bg-secondary data-checked:text-secondary-foreground data-checked:shadow-lg",
        accent: "data-checked:bg-accent data-checked:text-accent-foreground data-checked:shadow-lg",
        destructive: "data-checked:bg-destructive data-checked:text-destructive-foreground data-checked:shadow-lg",
        outline: "data-checked:border-primary data-checked:border-2 data-checked:shadow-lg",
        roma: "data-checked:bg-roma data-checked:text-primary-foreground data-checked:shadow-lg",
        kana: "data-checked:bg-kana data-checked:text-primary-foreground data-checked:shadow-lg",
        english: "data-checked:bg-english data-checked:text-primary-foreground data-checked:shadow-lg",
        romakana:
          "data-checked:bg-gradient-to-r data-checked:from-roma data-checked:to-kana data-checked:text-primary-foreground data-checked:shadow-lg",
        flick: "data-checked:bg-flick data-checked:text-primary-foreground data-checked:shadow-lg",
        perfect: "data-checked:bg-perfect data-checked:text-primary-foreground data-checked:shadow-lg",
        all: "data-checked:bg-gradient-to-r data-checked:from-roma data-checked:via-kana data-checked:to-english data-checked:text-primary-foreground data-checked:shadow-lg",
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

interface RadioCardProps<Value = unknown> extends RadioPrimitive.Root.Props<Value> {
  variant?: VariantProps<typeof radioCardVariants>["variant"];
  size?: VariantProps<typeof radioCardVariants>["size"];
}

const RadioCard = <Value = unknown>({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: RadioCardProps<Value>) => {
  return (
    <RadioPrimitive.Root
      data-slot="radio-card"
      className={cn(radioCardVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </RadioPrimitive.Root>
  );
};

interface RadioButtonProps<Value = unknown> extends RadioPrimitive.Root.Props<Value> {
  variant?: VariantProps<typeof buttonVariants>["variant"];
  size?: VariantProps<typeof buttonVariants>["size"];
}

const RadioButton = <Value = unknown>({ className, variant, size, children, ...props }: RadioButtonProps<Value>) => {
  return (
    <RadioPrimitive.Root
      data-slot="radio-button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </RadioPrimitive.Root>
  );
};

export { RadioButton, RadioCard, RadioGroup, RadioGroupItem };
