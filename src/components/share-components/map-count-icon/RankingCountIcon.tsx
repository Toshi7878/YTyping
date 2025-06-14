import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { FaRankingStar } from "react-icons/fa6";

interface RankingCountProps {
  myRank: number | undefined;
  rankingCount: number;
}

const RankingCountIcon = ({ myRank, rankingCount }: RankingCountProps) => {
  const { data: session } = useSession();

  const getColorClass = () => {
    if (myRank === 1 && session) {
      return "text-perfect";
    } else if (myRank && session) {
      return "text-secondary";
    } else {
      return "text-muted-foreground/60";
    }
  };

  return (
    <TooltipWrapper label={`自分の順位: ${myRank}位`} disabled={!myRank || !session}>
      <div className={cn("z-[1] mr-1 flex items-baseline", getColorClass())}>
        <div className="relative top-[3px] mr-1">
          <FaRankingStar size={20} />
        </div>
        <div className="font-mono text-lg">{rankingCount}</div>
      </div>
    </TooltipWrapper>
  );
};

export default RankingCountIcon;
