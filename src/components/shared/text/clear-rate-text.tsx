import { cn } from "@/lib/utils"

interface ClearRateTextProps {
  isPerfect: boolean
  clearRate: number
}

const ClearRateText = ({ isPerfect, clearRate }: ClearRateTextProps) => {
  return <span className={cn(isPerfect && ["text-perfect", "outline-text"])}>{clearRate.toFixed(1)}%</span>
}

export default ClearRateText
