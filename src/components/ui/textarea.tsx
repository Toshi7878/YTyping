import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import * as React from "react";
import { useFormContext } from "react-hook-form";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-border/50 placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive bg-input flex field-sizing-content min-h-16 w-full rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

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
              {required && <span className="text-destructive ml-1">*</span>}
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

export { Textarea, TextareaFormField };
