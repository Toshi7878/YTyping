"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/utils/cn";

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

interface DataListProps extends useRender.ComponentProps<"dl">, VariantProps<typeof dataListVariants> {}

const DataList = ({ className, orientation = "horizontal", size, render, ref, ...props }: DataListProps) => {
  return (
    <DataListOrientationContext.Provider value={orientation || "horizontal"}>
      {useRender({
        defaultTagName: "dl",
        render,
        ref,
        props: mergeProps<"dl">(
          { className: cn(dataListVariants({ orientation, size }), className) } as React.ComponentProps<"dl">,
          props,
        ),
      })}
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

interface DataListValueProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const DataListValue = ({
  className,
  ref,
  ...props
}: DataListValueProps & { ref?: React.Ref<React.ComponentRef<"dd">> }) => <dd ref={ref} {...props} />;

export { DataList, DataListItem, DataListLabel, DataListValue };
