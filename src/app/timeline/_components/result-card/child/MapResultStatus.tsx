import ClearRateText from "@/components/shared/text/ClearRateText";
import { UserInputModeText } from "@/components/shared/text/UserInputModeText";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { RouterOutPuts } from "@/server/api/trpc";

interface MapResultStatusProps {
  result: RouterOutPuts["result"]["usersResultList"]["items"][number];
  className?: string;
}

export const MapResultStatus = ({ result, className }: MapResultStatusProps) => {
  const isPerfect = result?.status.miss === 0 && result?.status.lost === 0;

  return (
    <div className={cn("flex flex-col items-end gap-5", className)}>
      <div className="mb-2 flex flex-row gap-2">
        <Badge variant="result" size="lg">
          <UserInputModeText
            romaType={result.status.romaType}
            kanaType={result.status.kanaType}
            flickType={result.status.flickType}
            englishType={result.status.englishType}
            symbolType={result.status.symbolType}
            numType={result.status.numType}
            spaceType={result.status.spaceType}
          />
        </Badge>
        <Badge variant="result" size="lg">
          {result?.status.score}
        </Badge>
        <Badge variant="result" size="lg">
          <ClearRateText clearRate={result?.status.clearRate ?? 0} isPerfect={isPerfect} />
        </Badge>
      </div>
      <div className="flex flex-row gap-2">
        <Badge variant="result" size="lg">
          {result && result.status.playSpeed.toFixed(2)}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            倍速
          </span>
        </Badge>
        <Badge variant="result" size="lg">
          {result && result.status.kpm}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            kpm
          </span>
        </Badge>
      </div>
    </div>
  );
};

interface MapResultBadgesMobileProps extends MapResultStatusProps {
  className?: string;
  result: RouterOutPuts["result"]["usersResultList"]["items"][number];
}

export const MapResultBadgesMobile = ({ result, className }: MapResultBadgesMobileProps) => {
  const isPerfect = result?.status.miss === 0 && result.status.lost === 0;

  return (
    <div className={cn("visible flex w-full justify-around", className)}>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg" className={cn(result.rank === 1 && "text-perfect outline-text")}>
          Rank: #{result.rank}
        </Badge>
        <Badge variant="result" size="lg">
          {result && (
            <UserInputModeText
              romaType={result.status.romaType}
              kanaType={result.status.kanaType}
              flickType={result.status.flickType}
              englishType={result.status.englishType}
              symbolType={result.status.symbolType}
              numType={result.status.numType}
              spaceType={result.status.spaceType}
            />
          )}
        </Badge>
      </div>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg">
          {result.status.score}
        </Badge>
        <Badge variant="result" size="lg">
          {result.status.kpm}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            kpm
          </span>
        </Badge>
      </div>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg">
          <ClearRateText clearRate={result.status.clearRate} isPerfect={isPerfect} />
        </Badge>
        <Badge variant="result" size="lg">
          {result.status.playSpeed.toFixed(2)}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            倍速
          </span>
        </Badge>
      </div>
    </div>
  );
};
