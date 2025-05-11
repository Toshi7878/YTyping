import { Badge, BadgeProps } from "@chakra-ui/react";

interface CustomBadgeProps {
  isDisabled: boolean;
  isKbdHidden?: boolean;
}

const CustomBadge = ({
  isDisabled,
  isKbdHidden,
  onClick,
  children,
}: CustomBadgeProps & BadgeProps) => {
  return (
    <Badge
      as="button"
      variant="typeArea"
      className="bottom-card-badge"
      disabled={isDisabled}
      onClick={isDisabled || isKbdHidden ? undefined : onClick}
      cursor={isDisabled ? "not-allowed" : isKbdHidden || !onClick ? "initial" : "pointer"}
      opacity={isDisabled ? 0.5 : 1}
      _hover={{
        transform: isDisabled || isKbdHidden || !onClick ? "none" : "scale(1.05)",
      }}
    >
      {children}
    </Badge>
  );
};

export default CustomBadge;
