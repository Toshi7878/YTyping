"use client";

import { Input, inputVariants } from "@/components/ui/input/input";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/utils/global-hooks/useDebounce";
import { UseMutationResult } from "@tanstack/react-query";
import { VariantProps } from "class-variance-authority";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { FieldError, FieldErrorsImpl, Merge, useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";

interface InputFormFieldProps {
  name: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  required?: boolean;
  className?: string;
  variant?: VariantProps<typeof inputVariants>["variant"];
  size?: VariantProps<typeof inputVariants>["size"];
  disabledFormMessage?: boolean;
}

const InputFormField = ({
  name,
  label,
  description,
  required = false,
  className,
  size = "default",
  disabledFormMessage = false,
  ...inputProps
}: InputFormFieldProps & Omit<React.ComponentProps<"input">, "size">) => {
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
            <Input {...field} {...inputProps} variant={fieldState.error ? "error" : "default"} size={size} />
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
  mutation: UseMutationResult<any, any, any, any>;
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
}: MutationInputFormFieldProps &
  Omit<React.ComponentProps<typeof InputFormField>, "label" | "disabledFormMessage">) => {
  const { debounce, isPending, cancel } = useDebounce(debounceDelay);
  const {
    formState: { isDirty, errors },
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
      onChangeCapture={(e) => {
        props.onChangeCapture?.(e);
        mutation.reset();
        clearErrors(props.name);
        cancel();
        const value = e.currentTarget.value;

        debounce(async () => {
          if (isDirty && !errors[props.name] && value) {
            await mutation.mutateAsync(value);
            onSuccess?.(value);
          }
        });
      }}
      disabledFormMessage={true}
      {...props}
    />
  );
};

interface MutateMessageProps {
  isPending: boolean;
  isSuccess: boolean;
  successMessage: string;
  errorMessage: FieldError | Merge<FieldError, FieldErrorsImpl<any>> | undefined;
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

export { InputFormField, MutationInputFormField };
