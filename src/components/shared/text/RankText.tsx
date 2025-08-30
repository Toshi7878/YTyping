import { cn } from "@/lib/utils";
import React from "react";

interface RankTextProps {
  rank: number;
  children: React.ReactNode;
}

const RankText = ({ rank, children }: RankTextProps) => {
  return <span className={cn("ml-1", rank === 1 && ["text-perfect", "outline-text"])}>{children}</span>;
};

export default RankText;
