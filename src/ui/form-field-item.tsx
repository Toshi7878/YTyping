"use client";

import { createFormHook, createFormHookContexts } from "@tanstack/react-form";
import type { UseMutationResult } from "@tanstack/react-query";
import type { VariantProps } from "class-variance-authority";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import type React from "react";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import { useId } from "react";
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

export const { fieldContext, useFieldContext, formContext, useFormContext } = createFormHookContexts();

type FieldErrors = Array<{ message?: string } | undefined>;

interface InputFormFieldProps {
  label?: ReactNode;
  description?: ReactNode;
  required?: boolean;
  className?: string;
  variant?: VariantProps<typeof inputVariants>["variant"];
  size?: VariantProps<typeof inputVariants>["size"];
  disabledFormMessage?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

type InputPassthroughProps = Omit<
  ComponentPropsWithRef<typeof Input>,
  "size" | "value" | "name" | "onChange" | "onBlur"
>;

const InputField = ({
  id,
  label,
  description,
  required = false,
  className,
  size = "default",
  disabledFormMessage = false,
  errors,
  onChange,
  ...inputProps
}: InputFormFieldProps &
  InputPassthroughProps & {
    id: string;
    value: string;
    errors: FieldErrors;
    onBlur: () => void;
  }) => (
  <Field data-invalid={errors.length > 0}>
    {label && (
      <FieldLabel htmlFor={id}>
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </FieldLabel>
    )}
    <Input
      {...inputProps}
      id={id}
      aria-invalid={errors.length > 0}
      variant={errors.length > 0 ? "error" : "default"}
      size={size}
      className={className}
      onChange={onChange}
    />
    {description && <FieldDescription>{description}</FieldDescription>}
    {!disabledFormMessage && <FieldError errors={errors} />}
  </Field>
);

const InputFormField = ({ onChange, ...props }: InputFormFieldProps & Omit<InputPassthroughProps, "id">) => {
  const field = useFieldContext<string>();
  const id = useId();

  return (
    <InputField
      {...props}
      id={id}
      value={field.state.value}
      errors={field.state.meta.errors}
      onBlur={field.handleBlur}
      onChange={(e) => {
        field.handleChange(e.target.value);
        onChange?.(e);
      }}
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
  const field = useFieldContext<string>();
  const id = useId();
  const { debounce, isPending, cancel } = useDebounce(debounceDelay);
  const errors = field.state.meta.errors;

  return (
    <InputField
      {...props}
      id={id}
      value={field.state.value}
      errors={errors}
      onBlur={field.handleBlur}
      label={
        <div className="flex items-center gap-2">
          <span className="text-xs">{label}</span>
          <MutateMessage
            isPending={isPending}
            isSuccess={mutation.isSuccess}
            successMessage={successMessage}
            error={errors[0]}
          />
        </div>
      }
      disabledFormMessage={true}
      onChange={(e) => {
        field.handleChange(e.target.value);
        props.onChange?.(e);
        mutation.reset();
        field.setErrorMap({ ...field.state.meta.errorMap, onSubmit: undefined });
        cancel();
        const { value } = e.currentTarget;

        debounce(async () => {
          if (!field.state.meta.errors.length) {
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
  error: { message?: string } | undefined;
}

const MutateMessage = ({ isPending, isSuccess, error, successMessage }: MutateMessageProps) => {
  if (error?.message) {
    return (
      <div className="flex items-center gap-1">
        <XCircle className="h-4 w-4 text-destructive" />
        <span className="text-destructive text-xs">{error.message}</span>
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
  label?: string;
  description?: ReactNode;
  className?: string;
  variant?: VariantProps<typeof inputVariants>["variant"];
  size?: VariantProps<typeof inputVariants>["size"];
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabledFormMessage?: boolean;
}

const FloatingLabelInputFormField = ({
  label,
  description,
  className,
  size = "default",
  disabledFormMessage = false,
  onChange,
  disabled = false,
  ...inputProps
}: FloatingLabelInputFormFieldProps &
  Omit<ComponentProps<typeof Input>, "size" | "value" | "name" | "onChange" | "onBlur">) => {
  const field = useFieldContext<string>();
  const id = useId();
  const errors = field.state.meta.errors;

  return (
    <Field className={cn("w-full", className)} data-invalid={errors.length > 0}>
      <FloatingLabelInput
        {...inputProps}
        value={field.state.value}
        disabled={disabled}
        id={id}
        aria-invalid={errors.length > 0}
        label={label}
        variant={errors.length > 0 ? "error" : "default"}
        size={size}
        onBlur={field.handleBlur}
        onChange={(e) => {
          field.handleChange(e.target.value);
          onChange?.(e);
        }}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {!disabledFormMessage && <FieldError errors={errors} />}
    </Field>
  );
};

interface TextareaFormFieldProps {
  label?: string;
  description?: string;
  required?: boolean;
  className?: string;
  disabledFormMessage?: boolean;
}

const TextareaFormField = ({
  label,
  description,
  required = false,
  className,
  disabledFormMessage = false,
  ...textareaProps
}: TextareaFormFieldProps &
  Omit<React.ComponentProps<"textarea">, "name" | "className" | "value" | "onChange" | "onBlur">) => {
  const field = useFieldContext<string>();
  const id = useId();
  const errors = field.state.meta.errors;

  return (
    <Field data-invalid={errors.length > 0}>
      {label && (
        <FieldLabel htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-destructive">*</span>}
        </FieldLabel>
      )}
      <Textarea
        {...textareaProps}
        id={id}
        value={field.state.value}
        aria-invalid={errors.length > 0}
        className={className}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {!disabledFormMessage && <FieldError errors={errors} />}
    </Field>
  );
};

interface CheckboxFormFieldProps {
  label: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

const CheckboxFormField = ({
  label,
  description,
  onCheckedChange,
  ...props
}: CheckboxFormFieldProps & Omit<ComponentProps<typeof Checkbox>, "checked" | "onCheckedChange">) => {
  const field = useFieldContext<boolean>();
  const id = useId();
  const errors = field.state.meta.errors;

  return (
    <Field orientation="horizontal" data-invalid={errors.length > 0}>
      <Checkbox
        id={id}
        aria-invalid={errors.length > 0}
        checked={field.state.value}
        onCheckedChange={(checked) => {
          field.handleChange(checked === true);
          onCheckedChange?.(checked === true);
        }}
        onBlur={field.handleBlur}
        {...props}
      />

      <FieldLabel htmlFor={id} className="font-normal">
        {label}
      </FieldLabel>
      {description && <FieldDescription className="text-xs">{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
};

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFormFieldProps {
  label: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
  onValueChange?(value: string): void;
}

const SelectFormField = ({
  label,
  placeholder = "選択してください",
  description,
  options,
  onValueChange,
  ...props
}: SelectFormFieldProps & Omit<ComponentProps<typeof Select>, "value" | "defaultValue" | "onValueChange">) => {
  const field = useFieldContext<string>();
  const id = useId();
  const errors = field.state.meta.errors;

  return (
    <Field data-invalid={errors.length > 0}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        {...props}
        value={field.state.value}
        onValueChange={(value) => {
          field.handleChange(value);
          onValueChange?.(value);
        }}
      >
        <SelectTrigger id={id} aria-invalid={errors.length > 0} onBlur={field.handleBlur}>
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
      <FieldError errors={errors} />
    </Field>
  );
};

interface FloatingLabelSelectFormFieldProps {
  label: string;
  placeholder?: string;
  description?: string;
  options: SelectOption[];
  className?: string;
}

const FloatingLabelSelectFormField = ({
  label,
  placeholder = "選択してください",
  description,
  options,
  className,
  ...props
}: FloatingLabelSelectFormFieldProps &
  Omit<
    ComponentProps<typeof FloatingLabelSelect>,
    "value" | "defaultValue" | "onValueChange" | "label" | "options"
  >) => {
  const field = useFieldContext<string>();
  const errors = field.state.meta.errors;

  return (
    <Field className={className} data-invalid={errors.length > 0}>
      <FloatingLabelSelect
        onValueChange={field.handleChange}
        value={field.state.value}
        label={label}
        options={options}
        placeholder={placeholder}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldError errors={errors} />
    </Field>
  );
};

interface SwitchFormFieldProps {
  label?: string;
  description?: string;
}

const SwitchFormField = ({ label, description }: SwitchFormFieldProps) => {
  const field = useFieldContext<boolean>();
  const id = useId();

  return (
    <Field orientation="horizontal" className="items-start gap-3">
      <Switch id={id} checked={field.state.value} onCheckedChange={field.handleChange} onBlur={field.handleBlur} />
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
    </Field>
  );
};

interface TagInputFormFieldProps {
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
  label,
  description,
  className,
  maxTags,
  enableDragDrop = true,
  tagVariant = "secondary",
  disabledFormMessage = false,
  maxLength,
}: TagInputFormFieldProps) => {
  const field = useFieldContext<string[]>();
  const errors = field.state.meta.errors;

  return (
    <Field className="w-full" data-invalid={errors.length > 0}>
      <TagInput
        tags={field.state.value || []}
        onTagAdd={(tag) => {
          field.handleChange([...field.state.value, tag]);
        }}
        onTagRemove={(index) => {
          field.handleChange(field.state.value.filter((_, i) => i !== index));
        }}
        label={label}
        maxTags={maxTags}
        enableDragDrop={enableDragDrop}
        tagVariant={tagVariant}
        className={className}
        maxLength={maxLength}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {!disabledFormMessage && <FieldError errors={errors} />}
    </Field>
  );
};

const { useAppForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputFormField,
    MutationInputFormField,
    FloatingLabelInputFormField,
    TextareaFormField,
    CheckboxFormField,
    SelectFormField,
    FloatingLabelSelectFormField,
    SwitchFormField,
    TagInputFormField,
  },
  formComponents: {},
});

export { useAppForm, withForm };
