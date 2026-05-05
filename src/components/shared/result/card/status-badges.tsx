import { ClearRateText } from "@/components/shared/text/clear-rate-text";
import { InputModeText } from "@/components/shared/text/input-mode-text";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ResultWithMapItem } from "@/server/api/routers/result/list";

interface ResultStatusBadgesProps {
  result: ResultWithMapItem;
  className?: string;
}

export const ResultStatusBadges = ({ result, className }: ResultStatusBadgesProps) => {
  const isPerfect = result.otherStatus.miss === 0 && result.otherStatus.lost === 0;

  return (
    <div className={cn("flex flex-col items-end gap-5", className)}>
      <div className="mb-2 flex flex-row gap-2">
        <Badge variant="result" size="lg">
          <InputModeText typeCounts={result.typeCounts} />
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
          {result.typeSpeed.kpm}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            kpm
          </span>
        </Badge>
      </div>
    </div>
  );
};

interface ResultBadgesMobileProps {
  className?: string;
  result: ResultWithMapItem | null;
}

export const ResultBadgesMobile = ({ result, className }: ResultBadgesMobileProps) => {
  const isPerfect = result?.otherStatus.miss === 0 && result?.otherStatus.lost === 0;

  return (
    <div className={cn("visible flex w-full justify-around", className)}>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg" className={cn(result?.rank === 1 && "text-perfect outline-text")}>
          {result && `Rank: #${result.rank}`}
        </Badge>
        <Badge variant="result" size="lg">
          {result && <InputModeText typeCounts={result.typeCounts} />}
        </Badge>
      </div>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg">
          {result?.score}
        </Badge>
        <Badge variant="result" size="lg">
          {result && (
            <>
              {result.typeSpeed?.kpm}
              <span className="ml-1" style={{ letterSpacing: "2px" }}>
                kpm
              </span>
            </>
          )}
        </Badge>
      </div>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg">
          {result && <ClearRateText clearRate={result.otherStatus.clearRate} isPerfect={isPerfect} />}
        </Badge>
        <Badge variant="result" size="lg">
          {result && (
            <>
              {result.otherStatus.playSpeed.toFixed(2)}
              <span className="ml-1" style={{ letterSpacing: "2px" }}>
                倍速
              </span>
            </>
          )}
        </Badge>
      </div>
    </div>
  );
};
