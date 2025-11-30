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

const DataList = ({
  className,
  orientation = "horizontal",
  size,
  asChild = false,
  ref,
  ...props
}: DataListProps & { ref?: React.Ref<React.ComponentRef<"dl">> }) => {
  const Comp = asChild ? SlotPrimitive.Slot : "dl";

  return (
    <DataListOrientationContext.Provider value={orientation || "horizontal"}>
      <Comp ref={ref} className={cn(dataListVariants({ orientation, size }), className)} {...props} />
    </DataListOrientationContext.Provider>
  );
};

interface DataListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DataListItem = ({
  className,
  ref,
  ...props
}: DataListItemProps & { ref?: React.Ref<React.ComponentRef<"div">> }) => {
  const orientation = React.useContext(DataListOrientationContext);

  return (
    <div
      ref={ref}
      className={cn(className, "flex", orientation === "horizontal" ? "items-center" : "flex-col")}
      {...props}
    />
  );
};

interface DataListLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DataListLabel = ({
  className,
  ref,
  ...props
}: DataListLabelProps & { ref?: React.Ref<React.ComponentRef<"dt">> }) => (
  <dt ref={ref} className={cn("font-medium", className)} {...props} />
);

export interface DataListValueProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DataListValue = ({
  className,
  ref,
  ...props
}: DataListValueProps & { ref?: React.Ref<React.ComponentRef<"dd">> }) => <dd ref={ref} {...props} />;

export { DataList, DataListItem, DataListLabel, DataListValue };
