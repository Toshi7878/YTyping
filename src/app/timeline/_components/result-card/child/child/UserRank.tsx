import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";
import ResultBadge from "./child/ResultBadge";

interface UserRankProps extends HTMLAttributes<HTMLDivElement> {
  userRank: number;
}

const UserRank = ({ userRank, className, ...rest }: UserRankProps) => {
  const rankColor = userRank === 1 ? "text-yellow-500" : "text-foreground";
  const borderColor = userRank === 1 ? "border-yellow-500" : "border-foreground";

  return (
    <div className={cn("my-auto ml-4 text-lg font-bold", className)} {...rest}>
      <ResultBadge color={rankColor} borderColor={borderColor}>
        Rank: #{userRank}
      </ResultBadge>
    </div>
  );
};

export default UserRank;
