"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import type * as React from "react";
import { useState } from "react";
import { cn } from "@/utils/cn";

function TooltipProvider({ delay = 0, ...props }: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}
function Tooltip({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}
function TooltipTrigger({ ...props }: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}
function TooltipContent({
  className,
  sideOffset = 0,
  side,
  align,
  alignOffset,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> &
  Pick<React.ComponentProps<typeof TooltipPrimitive.Positioner>, "side" | "align" | "alignOffset" | "sideOffset">) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        className="isolate z-50"
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "data-open:fade-in-0 data-open:zoom-in-95 data-closed:fade-out-0 data-closed:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit max-w-xs origin-(--transform-origin) rounded-md border bg-background px-3 py-1.5 text-foreground text-xs data-closed:animate-out data-open:animate-in",
            className,
          )}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow
            className={cn(
              "z-50 size-2.5 rotate-45 rounded-[2px] bg-background",
              "data-[side=top]:-bottom-[5px] data-[side=top]:border-r data-[side=top]:border-b",
              "data-[side=bottom]:-top-[5px] data-[side=bottom]:border-t data-[side=bottom]:border-l",
              "data-[side=left]:-right-[5px] data-[side=left]:border-t data-[side=left]:border-r",
              "data-[side=right]:-left-[5px] data-[side=right]:border-b data-[side=right]:border-l",
            )}
          />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}
interface TooltipWrapperProps extends React.ComponentProps<typeof TooltipContent> {
  children: React.ReactNode;
  label?: React.ReactNode;
  delayDuration?: number;
  open?: boolean;
  disabled?: boolean;
  asChild?: boolean;
  /** Keep the tooltip open when the user presses outside it (e.g. while it's externally open-controlled). */
  disableOutsidePressDismiss?: boolean;
}

function TooltipWrapper({
  children,
  label,
  delayDuration,
  open,
  disabled = false,
  asChild = false,
  disableOutsidePressDismiss = false,
  ...props
}: TooltipWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!label || disabled) return <>{children}</>;

  return (
    <Tooltip
      open={open ?? isOpen}
      onOpenChange={(next, eventDetails) => {
        if (disableOutsidePressDismiss && !next && eventDetails.reason === "outside-press") {
          eventDetails.cancel();
          return;
        }
        setIsOpen(next);
      }}
    >
      <TooltipTrigger delay={delayDuration} render={asChild ? (children as React.ReactElement) : undefined}>
        {asChild ? undefined : children}
      </TooltipTrigger>
      <TooltipContent {...props} onMouseEnter={() => setIsOpen(false)}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export { TooltipProvider, TooltipWrapper };
