import type { ResultWithMapItem } from "@/server/api/routers/result/list";
import { ClearRateText } from "@/shared/result/clear-rate-text";
import { InputModeText } from "@/shared/result/input-mode-text";
import { ResultToolTipText } from "@/shared/result/result-tooltip-text";
import { Badge } from "@/ui/badge";
import { TooltipWrapper } from "@/ui/tooltip";
import { cn } from "@/utils/cn";

interface ResultStatusBadgesProps {
  result: ResultWithMapItem;
  className?: string;
}

export const ResultStatusBadges = ({ result, className }: ResultStatusBadgesProps) => {
  const isPerfect = result.otherStatus.miss === 0 && result.otherStatus.lost === 0;

  const { typeCounts, otherStatus, typeSpeed } = result;
  const { kanaType, flickType } = typeCounts;
  const totalType = Object.values(typeCounts).reduce((acc, curr) => acc + curr, 0);
  const isKanaFlickTyped = kanaType > 0 || flickType > 0;
  const missRate = ((totalType / (otherStatus.miss + totalType)) * 100).toFixed(1);

  return (
    <TooltipWrapper
      label={
        <ResultToolTipText
          typeCounts={typeCounts}
          otherStatus={otherStatus}
          missRate={missRate}
          typeSpeed={typeSpeed}
          isKanaFlickTyped={isKanaFlickTyped}
          updatedAt={result.updatedAt}
        />
      }
      side="left"
      align="center"
      collisionAvoidance={{ side: "none", align: "shift" }}
      delayDuration={0}
      asChild
    >
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
    </TooltipWrapper>
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
          {result && (result.invalidatedAt ? "BAN済み" : `Rank: #${result.rank}`)}
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
