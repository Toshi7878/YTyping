import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

interface CustomBadgeProps extends React.HTMLAttributes<HTMLElement> {
  isDisabled: boolean;
  isKbdHidden?: boolean;
  children: React.ReactNode;
}

const CustomBadge = ({
  isDisabled,
  isKbdHidden,
  onClick,
  children,
  className,
  ...props
}: CustomBadgeProps) => {
  const isClickable = !isDisabled && !isKbdHidden && !!onClick;

  return (
    <Badge
      asChild={isClickable}
      variant="outline"
      className={cn(
        "bottom-card-badge",
        isDisabled && "opacity-50 cursor-not-allowed",
        isKbdHidden && !onClick && "cursor-default",
        isClickable && "cursor-pointer hover:scale-105 transition-transform",
        className
      )}
      {...props}
    >
      {isClickable ? (
        <button onClick={onClick} disabled={isDisabled}>
          {children}
        </button>
      ) : (
        <span>{children}</span>
      )}
    </Badge>
  );
};

export default CustomBadge;
