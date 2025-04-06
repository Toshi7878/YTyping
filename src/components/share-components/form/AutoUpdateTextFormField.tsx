"use client";

import { ThemeColors } from "@/types";
import { FormControl, FormLabel, Input, Spinner, Text, useTheme } from "@chakra-ui/react";
import { FieldErrors, useFormContext } from "react-hook-form";

interface AutoUpdateTextFormFieldProps {
  isPending: boolean;
  isSuccess: boolean;
  label: string;
  placeholder?: string;
  successMessage: string;
  name: string;
}

const AutoUpdateTextFormField = ({
  isPending,
  isSuccess,
  label,
  placeholder = "",
  successMessage,
  name,
}: AutoUpdateTextFormFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <FormControl as="form" display="flex" flexDirection="column" width={{ base: "full", md: "sm" }}>
      <FormLabel display="flex" alignItems="center" gap={2}>
        {label}
        <MutateMessage isPending={isPending} isSuccess={isSuccess} errors={errors} successMessage={successMessage} />
      </FormLabel>
      <Input size="sm" autoComplete="off" {...register(name)} placeholder={placeholder} />
    </FormControl>
  );
};

interface MutateMessageProps {
  isPending: boolean;
  isSuccess: boolean;
  errors: FieldErrors;
  successMessage: string;
}

const MutateMessage = ({ isPending, isSuccess, errors, successMessage }: MutateMessageProps) => {
  const theme: ThemeColors = useTheme();

  if (Object.keys(errors).length > 0) {
    const errorMessage = Object.values(errors)
      .map((error) => error?.message)
      .join(", ");
    return (
      <Text as="span" color={theme.colors.error.light}>
        {errorMessage}
      </Text>
    );
  }

  if (isPending) {
    return <Spinner size="sm" />;
  }

  if (isSuccess) {
    return (
      <Text as="span" color={theme.colors.secondary.light}>
        {successMessage}
      </Text>
    );
  }

  return null;
};

export default AutoUpdateTextFormField;
