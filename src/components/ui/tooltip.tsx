"use client";

import { Tooltip as TooltipPrimitive } from "radix-ui";
import type * as React from "react";

import { cn } from "@/lib/utils";

function TooltipProvider({ delayDuration = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delayDuration={delayDuration} {...props} />;
}

function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-background text-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md border px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-background fill-background z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px] border-r border-b" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

interface TooltipWrapperProps {
  children: React.ReactNode;
  label: React.ReactNode;
  delayDuration?: number;
  open?: boolean;
  disabled?: boolean;
  toolTipTriggerProps?: React.ComponentProps<typeof TooltipPrimitive.Trigger>;
}

const TooltipWrapper = ({
  children,
  label,
  delayDuration = 0,
  open,
  disabled = false,
  toolTipTriggerProps,
  ...props
}: TooltipWrapperProps & React.ComponentProps<typeof TooltipPrimitive.Content>) => {
  return (
    <Tooltip delayDuration={delayDuration} open={disabled ? false : open}>
      <TooltipTrigger
        asChild
        onPointerEnter={disabled ? (e) => e.preventDefault() : undefined}
        onPointerLeave={disabled ? (e) => e.preventDefault() : undefined}
        onFocus={disabled ? (e) => e.preventDefault() : undefined}
        onBlur={disabled ? (e) => e.preventDefault() : undefined}
        {...toolTipTriggerProps}
      >
        {children}
      </TooltipTrigger>
      <TooltipContent {...props}>{label}</TooltipContent>
    </Tooltip>
  );
};

// export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
export { TooltipWrapper };
