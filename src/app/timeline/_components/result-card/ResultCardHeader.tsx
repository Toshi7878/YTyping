import { ResultCardInfo } from "@/app/timeline/ts/type";
import ResultClapButton from "./child/child/ResultClapButton";
import ResultUserName from "./child/child/ResultUserName";

interface ResultCardHeaderProps {
  result?: ResultCardInfo;
}

const ResultCardHeader = ({ result }: ResultCardHeaderProps) => {
  return (
    <div className="flex items-baseline justify-between">
      <ResultUserName result={result} />
      <ResultClapButton resultId={result?.id} clapCount={result?.clap_count} hasClap={result?.hasClap} />
    </div>
  );
};

export default ResultCardHeader;
