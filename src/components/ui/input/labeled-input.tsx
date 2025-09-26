"use client"

import type { VariantProps } from "class-variance-authority"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "../label"
import type { inputVariants } from "./input"
import { Input } from "./input"

export interface LabeledInputProps
  extends Omit<React.ComponentPropsWithRef<typeof Input>, "size">,
    VariantProps<typeof inputVariants> {
  label?: React.ReactNode
  labelClassName?: string
  containerClassName?: string
  required?: boolean
  error?: string
  description?: React.ReactNode
}

const LabeledInput = ({
  id,
  label,
  labelClassName,
  containerClassName,
  className,
  required = false,
  error,
  description,
  variant,
  size,
  ref,
  ...props
}: LabeledInputProps) => {
  const inputId = React.useId()
  const errorVariant = error ? "error" : variant

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label && (
        <Label htmlFor={inputId} className={cn("text-sm leading-none font-medium", labelClassName)}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      <Input
        ref={ref}
        id={inputId}
        variant={errorVariant}
        size={size}
        className={cn(error && "border-destructive focus-visible:ring-destructive/20", className)}
        {...props}
      />
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  )
}

export { LabeledInput }
