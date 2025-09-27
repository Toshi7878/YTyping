import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";

const spinnerVariants = cva("border-muted-foreground/80 border-t-primary animate-spin rounded-full", {
  variants: {
    size: {
      xs: "h-4 w-4 border-2",
      sm: "h-6 w-6 border-2",
      md: "h-8 w-8 border-3",
      lg: "h-10 w-10 border-4",
      xl: "h-12 w-12 border-4",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

interface SpinnerProps extends React.ComponentPropsWithRef<"div">, VariantProps<typeof spinnerVariants> {}

const Spinner = ({ size, className, ...rest }: SpinnerProps) => {
  return (
    <div className={cn("flex justify-center py-8", className)} {...rest}>
      <div className={spinnerVariants({ size })} />
    </div>
  );
};

export default Spinner;
