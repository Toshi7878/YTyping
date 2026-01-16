"use client";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { FaRankingStar } from "react-icons/fa6";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface RankingCountProps {
  myRank: number | null;
  rankingCount: number;
  myRankUpdatedAt: Date | null;
  className?: string;
}

export const RankingCount = ({ myRank, rankingCount, myRankUpdatedAt, className }: RankingCountProps) => {
  const { data: session } = useSession();

  const colorClass = buildColorClass(myRank, session);
  return (
    <TooltipWrapper
      label={
        <div>
          <p>
            自分の順位: <span className="font-bold">{myRank}位</span> (
            {myRankUpdatedAt?.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "numeric",
              day: "numeric",
            })}
            )
          </p>
        </div>
      }
      disabled={!myRank || !session}
    >
      <div className={cn("z-1 flex items-baseline", colorClass, className)}>
        <div className="relative top-[3px] mr-1">
          <FaRankingStar size={20} />
        </div>
        <div className="font-mono text-lg">{rankingCount}</div>
      </div>
    </TooltipWrapper>
  );
};

const buildColorClass = (myRank: number | null, session: Session | null) => {
  if (!session) {
    return "text-muted-foreground";
  }

  if (myRank === 1) {
    return "text-perfect";
  }
  if (myRank) {
    return "text-secondary";
  }
  return "text-muted-foreground";
};
