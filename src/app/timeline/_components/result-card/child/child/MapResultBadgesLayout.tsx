import { ResultCardInfo } from "@/app/timeline/ts/type";
import ClearRateText from "@/components/share-components/text/ClearRateText";
import { UserInputModeText } from "@/components/share-components/text/UserInputModeText";
import { cn } from "@/lib/utils";
import ResultBadge from "./child/ResultBadge";

interface ResultCardProps {
  result?: ResultCardInfo;
}

export const MapResultBadges = ({ result }: ResultCardProps) => {
  const isPerfect = result?.status.miss === 0 && result?.status.lost === 0;
  const rankColor = result?.rank === 1 ? "text-perfect" : "text-foreground";

  return (
    <div className={cn("mr-5 flex flex-col items-end gap-5", result ? "visible" : "invisible")}>
      <div className="mb-2 flex flex-row gap-2">
        <ResultBadge
          color={result?.rank === 1 ? "rgb(var(--perfect))" : "rgb(var(--foreground))"}
          letterSpacing={1}
          borderColor="rgb(var(--border))"
        >
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
        </ResultBadge>
        <ResultBadge color="rgb(var(--foreground))" letterSpacing={1.5} borderColor="rgb(var(--border))">
          {result?.status.score}
        </ResultBadge>
        <ResultBadge color="rgb(var(--foreground))" letterSpacing={1} borderColor="rgb(var(--border))">
          <ClearRateText clearRate={result?.status.clear_rate ?? 0} isPerfect={isPerfect} />
        </ResultBadge>
      </div>
      <div className="flex flex-row gap-2">
        <ResultBadge color="rgb(var(--foreground))" borderColor="rgb(var(--border))">
          {result && result.status.default_speed.toFixed(2)}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            倍速
          </span>
        </ResultBadge>
        <ResultBadge color="rgb(var(--foreground))" letterSpacing={1} borderColor="rgb(var(--border))">
          {result && result.status.kpm}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            kpm
          </span>
        </ResultBadge>
      </div>
    </div>
  );
};

interface MapResultBadgesMobileProps extends ResultCardProps {
  className?: string;
}

export const MapResultBadgesMobile = ({ result, className }: MapResultBadgesMobileProps) => {
  const isPerfect = result?.status.miss === 0 && result.status.lost === 0;

  return (
    <div className={cn("flex w-full justify-around", result ? "visible" : "invisible", className)}>
      <div className="mr-5 flex flex-col items-end gap-5">
        <ResultBadge
          letterSpacing={1}
          color={result?.rank === 1 ? "rgb(var(--perfect))" : "rgb(var(--foreground))"}
          borderColor="rgb(var(--border))"
        >
          Rank: #{result?.rank ?? 0}
        </ResultBadge>
        <ResultBadge letterSpacing={1} color="rgb(var(--foreground))" borderColor="rgb(var(--border))">
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
        </ResultBadge>
      </div>
      <div className="mr-5 flex flex-col items-end gap-5">
        <ResultBadge letterSpacing={1.5} color="rgb(var(--foreground))" borderColor="rgb(var(--border))">
          {result?.status.score ?? 0}
        </ResultBadge>
        <ResultBadge letterSpacing={1} color="rgb(var(--foreground))" borderColor="rgb(var(--border))">
          {result?.status.kpm ?? 0}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            kpm
          </span>
        </ResultBadge>
      </div>
      <div className="mr-5 flex flex-col items-end gap-5">
        <ResultBadge letterSpacing={1} color="rgb(var(--foreground))" borderColor="rgb(var(--border))">
          <ClearRateText clearRate={result?.status.clear_rate ?? 0} isPerfect={isPerfect} />
        </ResultBadge>
        <ResultBadge color="rgb(var(--foreground))" borderColor="rgb(var(--border))">
          {result && result.status.default_speed.toFixed(2)}
          <span className="ml-1" style={{ letterSpacing: "2px" }}>
            倍速
          </span>
        </ResultBadge>
      </div>
    </div>
  );
};
