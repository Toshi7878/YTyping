import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import React from "react";

interface MapBadgeProps {
  children: React.ReactNode;
  className?: string;
}

const MapBadge = ({ children, className, ...rest }: MapBadgeProps) => {
  return (
    <Badge variant="accent-light" className={cn("rounded-full px-2 text-sm", className)} {...rest}>
      {children}
    </Badge>
  );
};

export default MapBadge;
