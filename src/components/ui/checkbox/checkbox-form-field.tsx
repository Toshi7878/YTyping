import type { ComponentProps } from "react";
import { useFormContext } from "react-hook-form";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../form";
import { Checkbox } from "./checkbox";

interface CheckboxFormFieldProps {
  name: string;
  label: string;
  description?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export const CheckboxFormField = ({
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
