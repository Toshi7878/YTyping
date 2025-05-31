import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { Control } from "react-hook-form";

// TODO:chakra ui 移行後 !important削除
const inputVariants = cva(
  [
    "placeholder:text-muted-foreground selection:bg-primary",
    "selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0",
    "rounded-sm !border !border-solid bg-transparent !px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none",
    "file:text-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
    "md:text-sm focus-visible:border-ring focus-visible:ring-ring focus-visible:ring-[2px]",
  ],
  {
    variants: {
      variant: {
        default: "!border-border/50",
        error: "border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
        success: "border-green-500 focus-visible:border-green-600 focus-visible:ring-green-500/50",
        warning: "border-yellow-500 focus-visible:border-yellow-600 focus-visible:ring-yellow-500/50",
        info: "border-blue-500 focus-visible:border-blue-600 focus-visible:ring-blue-500/50",
      },
      size: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2 py-1 text-sm",
        lg: "h-11 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface InputProps extends Omit<React.ComponentProps<"input">, "size">, VariantProps<typeof inputVariants> {}

function Input({ className, type, variant, size, ...props }: InputProps) {
  return <input type={type} data-slot="input" className={cn(inputVariants({ variant, size }), className)} {...props} />;
}

interface InputFormFieldProps {
  control: Control<any>;
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
  variant?: VariantProps<typeof inputVariants>["variant"];
  size?: VariantProps<typeof inputVariants>["size"];
}

function InputFormField({
  control,
  name,
  label,
  description,
  required = false,
  className,
  variant = "default",
  size = "default",
  ...inputProps
}: InputFormFieldProps & Omit<React.ComponentProps<"input">, "size">) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(className)}>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input {...field} {...inputProps} variant={fieldState.error ? "error" : variant} size={size} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export { Input, InputFormField, inputVariants };
