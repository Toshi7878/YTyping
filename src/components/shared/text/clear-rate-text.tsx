import { cn } from "@/lib/utils";

interface ClearRateTextProps {
  isPerfect: boolean;
  clearRate: number;
  className?: string;
}

export const ClearRateText = ({ isPerfect, clearRate, className }: ClearRateTextProps) => {
  return <span className={cn(isPerfect && "text-perfect outline-text", className)}>{clearRate.toFixed(1)}%</span>;
};
