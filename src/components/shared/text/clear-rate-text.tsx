import { cn } from "@/lib/utils";

interface ClearRateTextProps {
  isPerfect: boolean;
  clearRate: number;
}

export const ClearRateText = ({ isPerfect, clearRate }: ClearRateTextProps) => {
  return <span className={cn(isPerfect && ["text-perfect", "outline-text"])}>{clearRate.toFixed(1)}%</span>;
};
