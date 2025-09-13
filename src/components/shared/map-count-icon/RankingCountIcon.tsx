"use client";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { FaRankingStar } from "react-icons/fa6";

interface RankingCountProps {
  myRank: number | undefined;
  rankingCount: number;
}

const RankingCountIcon = ({ myRank, rankingCount }: RankingCountProps) => {
  const { data: session } = useSession();
  const [colorClass, setColorClass] = useState("text-muted-foreground");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    if (!session) {
      setColorClass("text-muted-foreground");
      return;
    }

    if (myRank === 1) {
      setColorClass("text-perfect");
    } else if (myRank) {
      setColorClass("text-secondary");
    } else {
      setColorClass("text-muted-foreground");
    }
  }, [session, myRank]);

  return (
    <TooltipWrapper label={`自分の順位: ${myRank}位`} disabled={!myRank || !isMounted || !session}>
      <div className={cn("z-1 flex items-baseline", colorClass)}>
        <div className="relative top-[3px] mr-1">
          <FaRankingStar size={20} />
        </div>
        <div className="font-mono text-lg">{rankingCount}</div>
      </div>
    </TooltipWrapper>
  );
};

export default RankingCountIcon;
