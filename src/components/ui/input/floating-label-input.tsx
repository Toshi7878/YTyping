import type { VariantProps } from "class-variance-authority";
import type * as React from "react";
import { type ComponentRef, type PropsWithoutRef, useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../select/select";
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

type FloatingLabelSelectOption = {
  value: string;
  label: React.ReactNode;
  description?: string;
  disabled?: boolean;
};

type FloatingLabelSelectProps = React.ComponentProps<typeof Select> & {
  label: React.ReactNode;
  required?: boolean;
  options: FloatingLabelSelectOption[];
  placeholder?: string; // デフォルトは " "（プレースホルダ文字を出さず、ラベルだけ見せる）
  containerClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export const FloatingLabelSelect = ({
  label,
  required,
  options,
  containerClassName,
  triggerClassName,
  contentClassName,
  ...selectProps
}: FloatingLabelSelectProps) => {
  const id = useId();
  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Select {...selectProps}>
        <SelectTrigger id={id} className={cn("peer bg-input", triggerClassName)}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options.map((option) => (
            <SelectItem
              description={option.description}
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <FloatingLabel htmlFor={id}>
        {label}
        {required && <span className="text-destructive/80">*</span>}
      </FloatingLabel>
    </div>
  );
};

export { FloatingInput, FloatingLabel, FloatingLabelInput };
