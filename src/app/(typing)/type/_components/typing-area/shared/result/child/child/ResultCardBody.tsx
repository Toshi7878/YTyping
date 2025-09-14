import { TypeResult } from "@/app/(typing)/type/_lib/type";
import { CardContent } from "@/components/ui/card";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ResultCardContentProps {
  lineKanaWord: string;
  typeResult: TypeResult[];
  lineTypeWord: string;
  lostWord: string;
}

function ResultCardContent({ lineKanaWord, typeResult, lineTypeWord, lostWord }: ResultCardContentProps) {
  let correctCount = 0;

  return (
    <CardContent className="word-font gap-2 py-2 text-base">
      <div className="kana-word">
        <div>{lineKanaWord}</div>
      </div>
      <div className={cn("text-foreground word-outline-text tracking-wider break-all uppercase")}>
        {typeResult.map((type: TypeResult, index: number) => {
          if (type.is) {
            correctCount++;
          }

          const label = `time: ${type.t.toFixed(3)}, kpm: ${Math.floor(correctCount / (type.t / 60))}`;

          return (
            type.c && (
              <TooltipWrapper key={index} label={label} side="top">
                <span
                  className={cn(
                    "typed hover:bg-border/45 break-all",
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
        <span className="text-word-word break-all">{lostWord !== null ? lostWord : lineTypeWord}</span>
      </div>
    </CardContent>
  );
}

export default ResultCardContent;
