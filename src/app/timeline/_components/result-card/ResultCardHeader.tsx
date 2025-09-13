import { TimelineResult } from "@/app/timeline/_lib/type";
import DateDistanceText from "@/components/shared/text/DateDistanceText";
import { CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import ResultClapButton from "./child/ResultClapButton";

interface ResultCardHeaderProps {
  result: TimelineResult;
  className?: string;
}

const ResultCardHeader = ({ result, className }: ResultCardHeaderProps) => {
  return (
    <CardHeader className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-row items-center gap-2">
        <Link
          href={`/user/${result.player.id}`}
          className="text-secondary max-w-32 truncate font-bold hover:underline sm:max-w-none"
        >
          {result.player.name}
        </Link>
        {" - "}
        <DateDistanceText date={result.updated_at} />
      </div>
      <ResultClapButton
        mapId={result.map.id}
        resultId={result.id}
        clapCount={result.clap_count}
        hasClap={result.hasClap}
      />
    </CardHeader>
  );
};

export default ResultCardHeader;
