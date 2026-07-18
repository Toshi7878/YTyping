"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import type { VariantProps } from "class-variance-authority";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import type React from "react";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import { useId } from "react";
import type { ControllerRenderProps, FieldErrorsImpl, Merge, FieldError as RHFFieldError } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";
import type { badgeVariants } from "@/ui/badge";
import { Checkbox } from "@/ui/checkbox/checkbox";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/ui/field";
import { FloatingLabelInput, FloatingLabelSelect } from "@/ui/input/floating-label-input";
import type { inputVariants } from "@/ui/input/input";
import { Input } from "@/ui/input/input";
import { TagInput } from "@/ui/input/tag-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/ui/select/select";
import { Switch } from "@/ui/switch";
import { Textarea } from "@/ui/textarea";
import { cn } from "@/utils/cn";
import { useDebounce } from "@/utils/hooks/use-debounce";

interface InputFormFieldProps {
  name: string;
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  className?: string;
  variant?: VariantProps<typeof inputVariants>["variant"];
  size?: VariantProps<typeof inputVariants>["size"];
  disabledFormMessage?: boolean;
  ref?: ComponentPropsWithRef<typeof Input>["ref"];
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
}: InputFormFieldProps & Omit<ComponentPropsWithRef<typeof Input>, "size" | keyof ControllerRenderProps>) => {
  const { control } = useFormContext();
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          {label && (
            <FieldLabel htmlFor={id}>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FieldLabel>
          )}
          <Input
            {...inputProps}
            {...field}
            id={id}
            aria-invalid={!!fieldState.error}
            variant={fieldState.error ? "error" : "default"}
            size={size}
            className={className}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e);
            }}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {!disabledFormMessage && <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />}
        </Field>
      )}
    />
  );
};

interface MutationInputFormFieldProps {
  label: string;
  successMessage: string;
  mutation: UseMutationResult<unknown, unknown, string>;
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
          if (!errors[props.name]) {
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
  errorMessage: RHFFieldError | Merge<RHFFieldError, FieldErrorsImpl> | undefined;
}

const MutateMessage = ({ isPending, isSuccess, errorMessage, successMessage }: MutateMessageProps) => {
  if (errorMessage?.message) {
    const messageText =
      typeof errorMessage.message === "string" ? errorMessage.message : JSON.stringify(errorMessage.message);

    return (
      <div className="flex items-center gap-1">
        <XCircle className="h-4 w-4 text-destructive" />
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
        <span className="text-green-600 text-xs">{successMessage}</span>
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
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <Field className={cn("w-full", className)} data-invalid={!!fieldState.error}>
          <FloatingLabelInput
            {...field}
            {...inputProps}
            id={id}
            aria-invalid={!!fieldState.error}
            label={label}
            variant={fieldState.error ? "error" : "default"}
            size={size}
            onChange={(e) => {
              field.onChange(e);
              onChange?.(e);
            }}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {!disabledFormMessage && <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />}
        </Field>
      )}
    />
  );
};

interface TextareaFormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabledFormMessage?: boolean;
}

const TextareaFormField = ({
  name,
  label,
  description,
  required = false,
  className,
  disabledFormMessage = false,
  ...textareaProps
}: TextareaFormFieldProps & Omit<React.ComponentProps<"textarea">, "name" | "className">) => {
  const { control } = useFormContext();
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          {label && (
            <FieldLabel htmlFor={id}>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FieldLabel>
          )}
          <Textarea {...field} {...textareaProps} id={id} aria-invalid={!!fieldState.error} className={className} />
          {description && <FieldDescription>{description}</FieldDescription>}
          {!disabledFormMessage && <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />}
        </Field>
      )}
    />
  );
};

interface CheckboxFormFieldProps {
  name: string;
  label: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const CheckboxFormField = ({
  name,
  label,
  description,
  onCheckedChange,
  ...props
}: CheckboxFormFieldProps & ComponentProps<typeof Checkbox>) => {
  const form = useFormContext();
  const id = useId();

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field orientation="horizontal" data-invalid={!!fieldState.error}>
          <Checkbox
            id={id}
            aria-invalid={!!fieldState.error}
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              onCheckedChange?.(checked);
            }}
            {...props}
          />

          <FieldLabel htmlFor={id} className="font-normal">
            {label}
          </FieldLabel>
          {description && <FieldDescription className="text-xs">{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
        </Field>
      )}
    />
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
}

const SelectFormField = ({
  name,
  label,
  placeholder = "選択してください",
  description,
  options,
  ...props
}: SelectFormFieldProps & ComponentProps<typeof Select>) => {
  const form = useFormContext();
  const id = useId();

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <Select onValueChange={field.onChange} {...props} defaultValue={field.value}>
            <SelectTrigger id={id} aria-invalid={!!fieldState.error}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
        </Field>
      )}
    />
  );
};

interface FloatingLabelSelectFormFieldProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
  className?: string;
}

const FloatingLabelSelectFormField = ({
  name,
  label,
  placeholder = "選択してください",
  description,
  options,
  className,
  ...props
}: FloatingLabelSelectFormFieldProps & ComponentProps<typeof FloatingLabelSelect>) => {
  const form = useFormContext();

  return (
    <Controller
      control={form.control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className={className} data-invalid={!!fieldState.error}>
          <FloatingLabelSelect
            onValueChange={field.onChange}
            defaultValue={field.value}
            label={label}
            options={options}
            placeholder={placeholder}
            {...props}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
        </Field>
      )}
    />
  );
};

interface SwitchFormFieldProps {
  name: string;
  label?: string;
  description?: string;
  required?: boolean;
}

const SwitchFormField = ({
  name,
  label,
  description,
  required,
  ...props
}: SwitchFormFieldProps & Omit<React.ComponentProps<typeof Switch>, "name">) => {
  const { control } = useFormContext();
  const id = useId();

  return (
    <Controller
      control={control}
      name={name}
      rules={{ required }}
      render={({ field }) => (
        <Field orientation="horizontal" className="items-start gap-3">
          <Switch id={id} checked={field.value} onCheckedChange={field.onChange} />
          <FieldLabel htmlFor={id}>{label}</FieldLabel>
          <FieldDescription>{description}</FieldDescription>
        </Field>
      )}
      {...props}
    />
  );
};

interface TagInputFormFieldProps {
  name: string;
  label?: string;
  description?: ReactNode;
  className?: string;
  maxTags?: number;
  enableDragDrop?: boolean;
  tagVariant?: VariantProps<typeof badgeVariants>["variant"];
  disabledFormMessage?: boolean;
  maxLength?: number;
}

const TagInputFormField = ({
  name,
  label,
  description,
  className,
  maxTags,
  enableDragDrop = true,
  tagVariant = "secondary",
  disabledFormMessage = false,
  maxLength,
}: TagInputFormFieldProps) => {
  const { control, setValue, trigger } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <Field className="w-full" data-invalid={!!fieldState.error}>
          <TagInput
            tags={field.value || []}
            onTagAdd={(tag) => {
              const newTags = [...field.value, tag];
              setValue(name, newTags, { shouldDirty: true, shouldTouch: true });
              void trigger(name);
            }}
            onTagRemove={(index) => {
              const newTags = field.value.filter((_: string, i: number) => i !== index);
              setValue(name, newTags, { shouldDirty: true, shouldTouch: true });
              void trigger(name);
            }}
            label={label}
            maxTags={maxTags}
            enableDragDrop={enableDragDrop}
            tagVariant={tagVariant}
            className={className}
            maxLength={maxLength}
          />
          {description && <FieldDescription>{description}</FieldDescription>}
          {!disabledFormMessage && <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />}
        </Field>
      )}
    />
  );
};

export {
  CheckboxFormField,
  FloatingLabelInputFormField,
  FloatingLabelSelectFormField,
  InputFormField,
  MutationInputFormField,
  SelectFormField,
  SwitchFormField,
  TagInputFormField,
  TextareaFormField,
};
