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
}: CheckboxFormFieldProps & React.ComponentProps<typeof Checkbox>) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-y-0 space-x-3">
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
          <div className="space-y-1 leading-none">
            <FormLabel className="text-sm font-normal">{label}</FormLabel>
            {description && <FormDescription className="text-muted-foreground text-xs">{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};
