import Link from "next/link";
import DateDistanceText from "@/components/shared/text/date-distance-text";
import { CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RouterOutPuts } from "@/server/api/trpc";
import ResultClapButton from "./child/result-clap-button";

interface ResultCardHeaderProps {
  player: RouterOutPuts["result"]["usersResultList"]["items"][number]["player"];
  resultId: RouterOutPuts["result"]["usersResultList"]["items"][number]["id"];
  updatedAt: RouterOutPuts["result"]["usersResultList"]["items"][number]["updatedAt"];
  clap: RouterOutPuts["result"]["usersResultList"]["items"][number]["clap"];
  className?: string;
}

const ResultCardHeader = ({ player, resultId, updatedAt, clap, className }: ResultCardHeaderProps) => {
  return (
    <CardHeader className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-row items-center gap-2">
        <Link
          href={`/user/${player.id}`}
          className="text-secondary max-w-32 truncate font-bold hover:underline sm:max-w-none"
        >
          {player.name}
        </Link>
        {" - "}
        <DateDistanceText date={updatedAt} />
      </div>
      <ResultClapButton resultId={resultId} clapCount={clap.count} hasClapped={clap.hasClapped ?? false} />
    </CardHeader>
  );
};

export default ResultCardHeader;
