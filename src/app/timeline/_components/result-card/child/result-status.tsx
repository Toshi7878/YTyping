import ClearRateText from "@/components/shared/text/clear-rate-text";
import { InputModeText } from "@/components/shared/text/input-mode-text";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";

interface ResultStatusProps {
  result: RouterOutPuts["result"]["usersResultList"]["items"][number];
  className?: string;
}

export const ResultStatus = ({ result, className }: ResultStatusProps) => {
  const { typeCounts, otherStatus, typeSpeed } = result;
  const isPerfect = otherStatus.miss === 0 && otherStatus.lost === 0;

  return (
    <div className={cn("flex flex-col items-end gap-5", className)}>
      <div className="mb-2 flex flex-row gap-2">
        <Badge variant="result" size="lg">
          <InputModeText typeCounts={typeCounts} />
        </Badge>
        <Badge variant="result" size="lg">
          {result.score}
        </Badge>
        <Badge variant="result" size="lg">
          <ClearRateText clearRate={result.otherStatus.clearRate ?? 0} isPerfect={isPerfect} />
        </Badge>
      </div>
      <div className="flex flex-row gap-2">
        <Badge variant="result" size="lg">
          {result.otherStatus.playSpeed.toFixed(2)}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            倍速
          </span>
        </Badge>
        <Badge variant="result" size="lg">
          {typeSpeed.kpm}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            kpm
          </span>
        </Badge>
      </div>
    </div>
  );
};

interface ResultBadgesMobileProps extends ResultStatusProps {
  className?: string;
  result: RouterOutPuts["result"]["usersResultList"]["items"][number];
}

export const ResultBadgesMobile = ({ result, className }: ResultBadgesMobileProps) => {
  const { typeCounts, otherStatus, typeSpeed } = result;
  const isPerfect = otherStatus.miss === 0 && otherStatus.lost === 0;

  return (
    <div className={cn("visible flex w-full justify-around", className)}>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg" className={cn(result.rank === 1 && "text-perfect outline-text")}>
          Rank: #{result.rank}
        </Badge>
        <Badge variant="result" size="lg">
          <InputModeText typeCounts={typeCounts} />
        </Badge>
      </div>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg">
          {result.score}
        </Badge>
        <Badge variant="result" size="lg">
          {typeSpeed.kpm}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            kpm
          </span>
        </Badge>
      </div>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg">
          <ClearRateText clearRate={result.otherStatus.clearRate ?? 0} isPerfect={isPerfect} />
        </Badge>
        <Badge variant="result" size="lg">
          {result.otherStatus.playSpeed.toFixed(2)}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            倍速
          </span>
        </Badge>
      </div>
    </div>
  );
};
