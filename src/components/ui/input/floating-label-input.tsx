import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import type { ComponentRef, PropsWithoutRef } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { inputVariants } from "./input";
import { Input } from "./input";

export interface InputProps extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}

const FloatingInput = ({
  className,
  ref,
  ...props
}: React.PropsWithoutRef<InputProps> & { ref?: React.Ref<React.ComponentRef<typeof Input>> }) => {
  return <Input placeholder=" " className={cn("peer", className)} ref={ref} {...props} />;
};

const FloatingLabel = ({
  className,
  ref,
  ...props
}: React.ComponentPropsWithoutRef<typeof Label> & { ref?: React.Ref<React.ComponentRef<typeof Label>> }) => {
  return (
    <Label
      className={cn(
        "peer-focus:secondary peer-focus:dark:secondary absolute start-2 top-2 z-10 origin-left -translate-y-4 scale-75 transform cursor-text bg-input px-2 text-muted-foreground text-sm duration-300 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-2 peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 rtl:peer-focus:left-auto rtl:peer-focus:translate-x-1/4",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
};

interface FloatingLabelInputProps extends InputProps {
  label?: string;
  className?: string;
  containerClassName?: string;
  maxLength?: number;
}
const FloatingLabelInput = ({
  id,
  label,
  className,
  containerClassName,
  ref,
  ...props
}: PropsWithoutRef<FloatingLabelInputProps> & {
  ref?: React.Ref<ComponentRef<typeof FloatingInput>>;
}) => {
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <FloatingInput ref={ref} id={id} className={className} {...props} maxLength={props.maxLength} />
      <FloatingLabel htmlFor={id}>
        {label}
        {props.required && <span className="text-destructive/80">*</span>}
      </FloatingLabel>
    </div>
  );
};

export { FloatingInput, FloatingLabel, FloatingLabelInput };
