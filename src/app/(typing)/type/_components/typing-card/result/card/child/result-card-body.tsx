import { CardContent } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { TypeResult } from "@/validator/result";

interface ResultCardContentProps {
  lineKanaWord: string;
  types: TypeResult[];
  lineTypeWord: string;
  lostWord: string;
}

export const ResultCardContent = ({ lineKanaWord, types, lineTypeWord, lostWord }: ResultCardContentProps) => {
  let correctCount = 0;

  return (
    <CardContent className="word-font gap-2 py-2 text-base">
      <div className="kana-word">
        <div>{lineKanaWord}</div>
      </div>
      <div className={cn("word-outline-text break-all text-foreground uppercase tracking-wider")}>
        {types.map((type: TypeResult, index: number) => {
          if (type.is) {
            correctCount++;
          }

          const label = `time: ${type.t.toFixed(3)}, kpm: ${Math.floor(correctCount / (type.t / 60))}`;

          return (
            type.c && (
              <TooltipWrapper key={`${index}-${type.c}`} label={label} side="top" asChild>
                <span
                  className={cn(
                    "typed break-all hover:bg-border/45",
                    type.is ? (lostWord === "" ? "text-word-completed" : "text-word-correct") : "text-destructive",
                  )}
                  data-time={type.t}
                >
                  {type.c.replace(/ /g, "ˍ")}
                </span>
              </TooltipWrapper>
            )
          );
        })}
        <span className="break-all text-word-word">{types.length === 0 ? lineTypeWord : lostWord}</span>
      </div>
    </CardContent>
  );
};
