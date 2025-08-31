import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";
import { Input, inputVariants } from "./input";

export interface InputProps extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}

const FloatingInput = React.forwardRef<React.ComponentRef<typeof Input>, React.PropsWithoutRef<InputProps>>(
  ({ className, ...props }, ref) => {
    return <Input placeholder=" " className={cn("peer", className)} ref={ref} {...props} />;
  },
);
FloatingInput.displayName = "FloatingInput";

const FloatingLabel = React.forwardRef<React.ComponentRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
  ({ className, ...props }, ref) => {
    return (
      <Label
        className={cn(
          "peer-focus:secondary peer-focus:dark:secondary bg-input text-muted-foreground absolute start-2 top-2 z-10 origin-[0] -translate-y-4 scale-75 transform cursor-text px-2 text-sm duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
FloatingLabel.displayName = "FloatingLabel";

interface FloatingLabelInputProps extends InputProps {
  label?: string;
  className?: string;
  containerClassName?: string;
  maxLength?: number;
}
const FloatingLabelInput = React.forwardRef<
  React.ComponentRef<typeof FloatingInput>,
  React.PropsWithoutRef<FloatingLabelInputProps>
>(({ id, label, className, containerClassName, ...props }, ref) => {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <FloatingInput ref={ref} id={id} className={className} {...props} maxLength={props.maxLength} />
      <FloatingLabel htmlFor={id}>
        {label}
        {props.required && <span className="text-error/80">*</span>}
      </FloatingLabel>
    </div>
  );
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingInput, FloatingLabel, FloatingLabelInput };
