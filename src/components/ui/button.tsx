import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { Slot as SlotPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        "primary-hover-light":
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary-light border border-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline: "border bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground border-border",
        secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        unstyled: "",
        success: "bg-success text-success-foreground shadow-xs hover:bg-success/90",
        warning: "bg-warning text-warning-foreground shadow-xs hover:bg-warning/90",
        info: "bg-info text-info-foreground shadow-xs hover:bg-info/90",
        accent: "bg-accent text-accent-foreground shadow-xs hover:bg-accent/90",
        "outline-success": "border border-success text-success shadow-xs hover:bg-success/50",
        "outline-destructive": "border border-destructive text-destructive shadow-xs hover:bg-destructive/50",
        "outline-warning": "border border-warning text-warning shadow-xs hover:bg-warning/50",
        "outline-info": "border border-info text-info shadow-xs hover:bg-info/50",
        "outline-accent": "border shadow-xs hover:bg-accent",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 px-2 py-1 has-[>svg]:px-1.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-4 text-lg",
        "4xl": "h-26 rounded-md w-88 has-[>svg]:px-8 text-2xl font-bold",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const loadingVariants = cva("text-primary-foreground animate-spin rounded-full", {
  variants: {
    size: {
      default: "size-6",
      xs: "size-2",
      sm: "size-6",
      lg: "size-8",
      xl: "size-8",
      "4xl": "size-12",
      icon: "size-6",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  children,
  disabled,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
    loading?: boolean;
  }) {
  const Comp = asChild ? SlotPrimitive.Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
      disabled={loading || disabled}
    >
      {loading ? <Loader2 className={loadingVariants({ size })} /> : children}
    </Comp>
  );
}

export { Button, buttonVariants };
