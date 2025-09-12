"use client";
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
    if (!session) {
      return "text-muted-foreground";
    }

    if (myRank === 1) {
      return "text-perfect";
    } else if (myRank) {
      return "text-secondary";
    } else {
      return "text-muted-foreground";
    }
  };

  return (
    <TooltipWrapper label={`自分の順位: ${myRank}位`} disabled={!myRank || !session}>
      <div className={cn("z-1 flex items-baseline", getColorClass())}>
        <div className="relative top-[3px] mr-1">
          <FaRankingStar size={20} />
        </div>
        <div className="font-mono text-lg">{rankingCount}</div>
      </div>
    </TooltipWrapper>
  );
};

export default RankingCountIcon;
