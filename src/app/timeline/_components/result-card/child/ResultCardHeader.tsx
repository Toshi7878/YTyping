import { ResultCardInfo } from "@/app/timeline/ts/type";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import { CardHeader } from "@/components/ui/card";
import Link from "@/components/ui/link/link";
import { cn } from "@/lib/utils";
import ResultClapButton from "./child/ResultClapButton";

interface ResultCardHeaderProps {
  result: ResultCardInfo;
  className?: string;
}

const ResultCardHeader = ({ result, className }: ResultCardHeaderProps) => {
  return (
    <CardHeader className={cn("flex items-center justify-between", className)}>
      <div className="flex flex-row items-center gap-2">
        <Link href={`/user/${result.player.id}`} className="text-secondary max-w-32 truncate font-bold hover:underline">
          {result.player.name}
        </Link>
        {" - "}
        <DateDistanceText date={new Date(result.updated_at)} />
      </div>
      <ResultClapButton resultId={result.id} clapCount={result.clap_count} hasClap={result.hasClap} />
    </CardHeader>
  );
};

export default ResultCardHeader;
