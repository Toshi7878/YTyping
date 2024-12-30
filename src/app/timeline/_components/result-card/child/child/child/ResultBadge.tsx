import { ThemeColors } from "@/types";
import { Badge, useTheme } from "@chakra-ui/react";
import React from "react";

interface ResultBadgeProps {
  letterSpacing?: number;
  color: string;
  borderColor: string;
  children: React.ReactNode;
}

const ResultBadge = (props: ResultBadgeProps) => {
  const theme: ThemeColors = useTheme();

  return (
    <Badge
      className="min-w-[97.55px] lg:text-lg"
      borderRadius="lg"
      fontSize="lg"
      textAlign="center"
      border="solid 1px"
      textTransform="none"
      letterSpacing={props.letterSpacing}
      bg={theme.colors.background.card}
      color={props.color}
      borderColor={props.borderColor}
    >
      {props.children}
    </Badge>
  );
};

export default ResultBadge;
