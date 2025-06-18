import { ResultCardInfo } from "@/app/timeline/ts/type";
import DateDistanceText from "@/components/share-components/text/DateDistanceText";
import { CardHeader } from "@/components/ui/card";
import Link from "@/components/ui/link/link";
import { cn } from "@/lib/utils";
import ResultClapButton from "./child/ResultClapButton";

interface ResultCardHeaderProps {
  result?: ResultCardInfo;
  className?: string;
}

const ResultCardHeader = ({ result, className }: ResultCardHeaderProps) => {
  return (
    <CardHeader className={cn("mx-6 flex justify-between", className)}>
      <ResultUserName result={result} />
      <ResultClapButton resultId={result?.id} clapCount={result?.clap_count} hasClap={result?.hasClap} />
    </CardHeader>
  );
};

const ResultUserName = ({ result }: { result?: ResultCardInfo }) => {
  return (
    <div className="flex flex-row items-center gap-2">
      {result ? (
        <>
          <Link href={`/user/${result.player.id}`} className="text-secondary font-bold hover:underline">
            {result.player.name}
          </Link>{" "}
          - <DateDistanceText date={new Date(result.updated_at)} />
        </>
      ) : (
        ""
      )}
    </div>
  );
};

export default ResultCardHeader;
