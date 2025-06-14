import { TypeResult } from "@/app/(typing)/type/ts/type";
import { TooltipWrapper } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface ResultCardBodyProps {
  lineKanaWord: string;
  typeResult: TypeResult[];
  lineTypeWord: string;
  lostWord: string;
}

function ResultCardBody({ lineKanaWord, typeResult, lineTypeWord, lostWord }: ResultCardBodyProps) {
  let correctCount = 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="kana-word">
        <div>{lineKanaWord}</div>
      </div>
      <div
        className={cn(
          "text-foreground uppercase outline-text tracking-wider break-all"
        )}
      >
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
                    type.is
                      ? lostWord === ""
                        ? "text-[var(--color-secondary)]" // completed color
                        : "text-[var(--color-primary)]" // correct color
                      : "text-destructive" // error color
                  )}
                  data-time={type.t}
                >
                  {type.c.replace(/ /g, "ˍ")}
                </span>
              </TooltipWrapper>
            )
          );
        })}
        <span className="break-all">
          {lostWord !== null ? lostWord : lineTypeWord}
        </span>
      </div>
    </div>
  );
}

export default memo(ResultCardBody);
