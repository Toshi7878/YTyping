"use client";

import type { inputVariants } from "@/components/ui/input/input";
import { Input } from "@/components/ui/input/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/utils/hooks/useDebounce";
import type { UseMutationResult } from "@tanstack/react-query";
import type { VariantProps } from "class-variance-authority";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import type { ControllerRenderProps, FieldError, FieldErrorsImpl, Merge } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { FloatingLabelInput } from "./floating-label-input";

interface InputFormFieldProps {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  className?: string;
  variant?: VariantProps<typeof inputVariants>["variant"];
  size?: VariantProps<typeof inputVariants>["size"];
  disabledFormMessage?: boolean;
  onChange?: ControllerRenderProps["onChange"];
}

const InputFormField = ({
  name,
  label,
  description,
  required = false,
  className,
  size = "default",
  disabledFormMessage = false,
  onChange,
  ...inputProps
}: InputFormFieldProps & Omit<ComponentProps<typeof Input>, "size" | keyof ControllerRenderProps>) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </FormLabel>
          )}
          <FormControl className={cn(className)}>
            <Input
              {...inputProps}
              {...field}
              variant={fieldState.error ? "error" : "default"}
              size={size}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {!disabledFormMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
};

interface MutationInputFormFieldProps {
  label: string;
  successMessage: string;
  mutation: UseMutationResult;
  debounceDelay?: number;
  onSuccess?: (value: string) => void;
}

const MutationInputFormField = ({
  label,
  successMessage,
  mutation,
  debounceDelay = 1000,
  onSuccess,
  ...props
}: MutationInputFormFieldProps & Omit<ComponentProps<typeof InputFormField>, "label" | "disabledFormMessage">) => {
  const { debounce, isPending, cancel } = useDebounce(debounceDelay);
  const {
    formState: { errors },
    clearErrors,
  } = useFormContext();

  return (
    <InputFormField
      label={
        <div className="flex items-center gap-2">
          <span className="text-xs">{label}</span>
          <MutateMessage
            isPending={isPending}
            isSuccess={mutation.isSuccess}
            successMessage={successMessage}
            errorMessage={errors[props.name]}
          />
        </div>
      }
      disabledFormMessage={true}
      {...props}
      onChange={(e) => {
        props.onChange?.(e);
        mutation.reset();
        clearErrors(props.name);
        cancel();
        const { value } = e.currentTarget;

        debounce(async () => {
          if (!errors[props.name] && value) {
            await mutation.mutateAsync(value);
            onSuccess?.(value);
          }
        });
      }}
    />
  );
};

interface MutateMessageProps {
  isPending: boolean;
  isSuccess: boolean;
  successMessage: string;
  errorMessage: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined;
}

const MutateMessage = ({ isPending, isSuccess, errorMessage, successMessage }: MutateMessageProps) => {
  if (errorMessage?.message) {
    const messageText =
      typeof errorMessage.message === "string" ? errorMessage.message : JSON.stringify(errorMessage.message);

    return (
      <div className="flex items-center gap-1">
        <XCircle className="text-destructive h-4 w-4" />
        <span className="text-destructive text-xs">{messageText}</span>
      </div>
    );
  }
  if (isPending) {
    return <Loader2 className="h-4 w-4 animate-spin" />;
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-1">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-xs text-green-600">{successMessage}</span>
      </div>
    );
  }

  return null;
};

interface FloatingLabelInputFormFieldProps {
  name: string;
  label?: string;
  description?: ReactNode;
  className?: string;
  variant?: VariantProps<typeof inputVariants>["variant"];
  size?: VariantProps<typeof inputVariants>["size"];
  disabled?: boolean;
  onChange?: ControllerRenderProps["onChange"];
  disabledFormMessage?: boolean;
}

const FloatingLabelInputFormField = ({
  name,
  label,
  description,
  className,
  size = "default",
  disabledFormMessage = false,
  onChange,
  disabled = false,
  ...inputProps
}: FloatingLabelInputFormFieldProps & Omit<ComponentProps<typeof Input>, "size" | keyof ControllerRenderProps>) => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <FormItem className="w-full">
          <FormControl className={cn(className)}>
            <FloatingLabelInput
              {...field}
              {...inputProps}
              label={label}
              variant={fieldState.error ? "error" : "default"}
              size={size}
              onChange={(e) => {
                field.onChange(e);
                onChange?.(e);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {!disabledFormMessage && <FormMessage />}
        </FormItem>
      )}
    />
  );
};

export { FloatingLabelInputFormField, InputFormField, MutationInputFormField };
