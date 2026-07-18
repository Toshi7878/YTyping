"use client";

import type { UseMutationResult } from "@tanstack/react-query";
import type { VariantProps } from "class-variance-authority";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import type React from "react";
import type { ComponentProps, ComponentPropsWithRef, ReactNode } from "react";
import type { ControllerRenderProps, FieldError, FieldErrorsImpl, Merge } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import type { badgeVariants } from "@/ui/badge";
import { Checkbox } from "@/ui/checkbox/checkbox";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/ui/form";
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

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
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
  errorMessage: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined;
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

  return (
    <FormField
      control={control}
      name={name}
      disabled={disabled}
      render={({ field, fieldState }) => (
        <FormItem className={cn("w-full", className)}>
          <FormControl>
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

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem>
          {label && (
            <FormLabel>
              {label}
              {required && <span className="ml-1 text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl className={cn(className)}>
            <Textarea
              {...field}
              {...textareaProps}
              className={cn(fieldState.error && "border-destructive focus-visible:border-destructive")}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {!disabledFormMessage && <FormMessage />}
        </FormItem>
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

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-center">
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={(checked) => {
                field.onChange(checked);
                onCheckedChange?.(checked);
              }}
              {...props}
            />
          </FormControl>

          <FormLabel className="font-normal">{label}</FormLabel>
          {description && <FormDescription className="text-muted-foreground text-xs">{description}</FormDescription>}
          <FormMessage />
        </FormItem>
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

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <Select onValueChange={field.onChange} {...props} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
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
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FloatingLabelSelect
            onValueChange={field.onChange}
            defaultValue={field.value}
            label={label}
            options={options}
            {...props}
          />
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
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

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
          <FormLabel>{label}</FormLabel>
          <FormDescription>{description}</FormDescription>
        </FormItem>
      )}
      rules={{ required }}
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
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="w-full">
          <FormControl>
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
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {!disabledFormMessage && <FormMessage />}
        </FormItem>
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
