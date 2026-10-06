"use client";

import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import * as React from "react";

import { cn } from "@/utils/cn";

const PopoverAnchorContext = React.createContext<React.RefObject<Element | null> | null>(null);

function Popover({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  const anchorRef = React.useRef<Element | null>(null);
  return (
    <PopoverAnchorContext.Provider value={anchorRef}>
      <PopoverPrimitive.Root data-slot="popover" {...props} />
    </PopoverAnchorContext.Provider>
  );
}

function PopoverTrigger({ ...props }: React.ComponentProps<typeof PopoverPrimitive.Trigger>) {
  return <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />;
}

function PopoverContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> &
  Pick<React.ComponentProps<typeof PopoverPrimitive.Positioner>, "align" | "sideOffset" | "side" | "alignOffset">) {
  const anchorRef = React.useContext(PopoverAnchorContext);

  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        className="isolate z-50"
        align={align}
        sideOffset={sideOffset}
        anchor={anchorRef ?? undefined}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            "data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-screen origin-(--transform-origin) rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden data-closed:animate-out data-open:animate-in sm:w-72",
            className,
          )}
          initialFocus={false}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  );
}

interface PopoverAnchorProps extends Omit<React.ComponentPropsWithRef<"span">, "children"> {
  asChild?: boolean;
  children?: React.ReactNode;
}

function PopoverAnchor({ asChild = false, children, ...props }: PopoverAnchorProps) {
  const anchorRef = React.useContext(PopoverAnchorContext);

  const setAnchor = React.useCallback(
    (node: Element | null) => {
      if (anchorRef) anchorRef.current = node;
    },
    [anchorRef],
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<{ ref?: React.Ref<Element> }>, { ref: setAnchor });
  }

  return (
    <span data-slot="popover-anchor" ref={setAnchor} {...props}>
      {children}
    </span>
  );
}

export { Popover, PopoverAnchor, PopoverContent, PopoverTrigger };
