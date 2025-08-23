import { cn } from "@/lib/utils";
import { LocalClapState } from "@/types";

interface ClapedTextProps {
  clapOptimisticState: LocalClapState;
}

const ClapedText = ({ clapOptimisticState }: ClapedTextProps) => {
  return (
    <span className={cn(clapOptimisticState.hasClap && ["text-yellow-500", "outline-text"])}>
      {clapOptimisticState.clapCount}
    </span>
  );
};

export default ClapedText;
