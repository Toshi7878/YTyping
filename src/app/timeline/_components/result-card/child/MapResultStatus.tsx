import { TimelineResult } from "@/app/timeline/_lib/type";
import ClearRateText from "@/components/shared/text/ClearRateText";
import { UserInputModeText } from "@/components/shared/text/UserInputModeText";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MapResultStatusProps {
  result: TimelineResult;
  className?: string;
}

export const MapResultStatus = ({ result, className }: MapResultStatusProps) => {
  const isPerfect = result?.status.miss === 0 && result?.status.lost === 0;

  return (
    <div className={cn("flex flex-col items-end gap-5", className)}>
      <div className="mb-2 flex flex-row gap-2">
        <Badge variant="result" size="lg">
          <UserInputModeText
            romaType={result.status.roma_type}
            kanaType={result.status.kana_type}
            flickType={result.status.flick_type}
            englishType={result.status.english_type}
            symbolType={result.status.symbol_type}
            numType={result.status.num_type}
            spaceType={result.status.space_type}
          />
        </Badge>
        <Badge variant="result" size="lg">
          {result?.status.score}
        </Badge>
        <Badge variant="result" size="lg">
          <ClearRateText clearRate={result?.status.clear_rate ?? 0} isPerfect={isPerfect} />
        </Badge>
      </div>
      <div className="flex flex-row gap-2">
        <Badge variant="result" size="lg">
          {result && result.status.default_speed.toFixed(2)}
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
  result: TimelineResult;
}

export const MapResultBadgesMobile = ({ result, className }: MapResultBadgesMobileProps) => {
  const isPerfect = result?.status.miss === 0 && result.status.lost === 0;

  return (
    <div className={cn("visible flex w-full justify-around", className)}>
      <div className="mr-5 flex flex-col items-end gap-5">
        <Badge variant="result" size="lg">
          Rank: #{result.rank}
        </Badge>
        <Badge variant="result" size="lg">
          {result && (
            <UserInputModeText
              romaType={result.status.roma_type}
              kanaType={result.status.kana_type}
              flickType={result.status.flick_type}
              englishType={result.status.english_type}
              symbolType={result.status.symbol_type}
              numType={result.status.num_type}
              spaceType={result.status.space_type}
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
          <ClearRateText clearRate={result.status.clear_rate} isPerfect={isPerfect} />
        </Badge>
        <Badge variant="result" size="lg">
          {result.status.default_speed.toFixed(2)}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            倍速
          </span>
        </Badge>
      </div>
    </div>
  );
};
