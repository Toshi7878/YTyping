"use client";

import { Switch as SwitchPrimitive } from "radix-ui";
import type * as React from "react";
import { useFormContext } from "react-hook-form";
import { cn } from "@/lib/utils";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "./form";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs outline-none transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full bg-background ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

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

export { Switch, SwitchFormField };
