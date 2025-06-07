"use client";

import { InputFormField } from "@/components/ui/input/input";
import { useDebounce } from "@/utils/global-hooks/useDebounce";
import { UseMutationResult } from "@tanstack/react-query";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useEffect } from "react";
import { FieldError, FieldErrorsImpl, Merge, useFormContext } from "react-hook-form";

interface AutoUpdateTextFormFieldProps {
  label: string;
  successMessage: string;
  mutation: UseMutationResult<any, any, any, any>;
  debounceDelay?: number;
  onSuccess?: (value: string) => void;
}

const AutoUpdateTextFormField = ({
  label,
  successMessage,
  mutation,
  debounceDelay = 1000,
  onSuccess,
  ...props
}: AutoUpdateTextFormFieldProps &
  Omit<React.ComponentProps<typeof InputFormField>, "label" | "disabledFormMessage">) => {
  const { debounce, isPending, cancel } = useDebounce(debounceDelay);
  const {
    formState: { isDirty, errors },
    watch,
    clearErrors,
  } = useFormContext();
  const value = watch(props.name);

  useEffect(() => {
    debounce(async () => {
      if (isDirty && !errors[props.name] && value) {
        try {
          await mutation.mutateAsync(value);
          onSuccess?.(value);
        } catch (error) {
          console.log("Mutation failed:", error);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, value, errors[props.name]]);

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
      <div className="flex items-center gap-2">
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
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span className="text-xs text-green-600">{successMessage}</span>
      </div>
    );
  }

  return null;
};

export default AutoUpdateTextFormField;
