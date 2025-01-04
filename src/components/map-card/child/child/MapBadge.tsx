import { Badge, BadgeProps } from "@chakra-ui/react";
import React from "react";

interface MapBadgeProps {
  children: React.ReactNode;
}

const MapBadge = ({ children, ...rest }: MapBadgeProps & BadgeProps) => {
  return (
    <Badge fontSize="sm" borderRadius="full" px={2} {...rest}>
      {children}
    </Badge>
  );
};

export default MapBadge;
