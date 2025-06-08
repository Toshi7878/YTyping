import { Badge } from "@/components/ui/badge";
import React from "react";

interface ResultBadgeProps {
  letterSpacing?: number;
  color: string;
  borderColor: string;
  children: React.ReactNode;
}

const ResultBadge = ({ letterSpacing, color, borderColor, children }: ResultBadgeProps) => {
  return (
    <Badge
      className="bg-card min-w-[97.55px] rounded-lg border text-center text-lg normal-case lg:text-lg"
      style={{
        letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
        color: color,
        borderColor: borderColor,
      }}
    >
      {children}
    </Badge>
  );
};

export default ResultBadge;
