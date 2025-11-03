"use client";

import { cva, type VariantProps } from "class-variance-authority";
import { Slot as SlotPrimitive } from "radix-ui";
import * as React from "react";
import { cn } from "@/lib/utils";

const DataListOrientationContext = React.createContext<"horizontal" | "vertical">("horizontal");

const dataListVariants = cva("overflow-hidden font-normal text-left", {
  variants: {
    orientation: {
      horizontal: "flex flex-col",
      vertical: "flex flex-col",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-lg",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
    size: "default",
  },
});

interface DataListProps extends React.HTMLAttributes<HTMLDListElement>, VariantProps<typeof dataListVariants> {
  asChild?: boolean;
}

const DataList = React.forwardRef<HTMLDListElement, DataListProps>(
  ({ className, orientation = "horizontal", size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? SlotPrimitive.Slot : "dl";

    return (
      <DataListOrientationContext.Provider value={orientation || "horizontal"}>
        <Comp ref={ref} className={cn(dataListVariants({ orientation, size }), className)} {...props} />
      </DataListOrientationContext.Provider>
    );
  },
);
DataList.displayName = "DataList";

interface DataListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DataListItem = React.forwardRef<HTMLDivElement, DataListItemProps>(({ className, ...props }, ref) => {
  const orientation = React.useContext(DataListOrientationContext);

  return (
    <div
      ref={ref}
      className={cn(className, "flex", orientation === "horizontal" ? "items-center" : "flex-col")}
      {...props}
    />
  );
});
DataListItem.displayName = "DataListItem";

interface DataListLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DataListLabel = React.forwardRef<HTMLDivElement, DataListLabelProps>(({ className, ...props }, ref) => (
  <dt ref={ref} className={cn("font-medium", className)} {...props} />
));
DataListLabel.displayName = "DataListLabel";

export interface DataListValueProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DataListValue = React.forwardRef<HTMLDivElement, DataListValueProps>(({ className, ...props }, ref) => (
  <dd ref={ref} {...props} />
));
DataListValue.displayName = "DataListValue";

export { DataList, DataListItem, DataListLabel, DataListValue };
