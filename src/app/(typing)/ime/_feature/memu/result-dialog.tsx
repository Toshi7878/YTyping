import { atom, useAtomValue } from "jotai";
import type { UserResult, WordResult } from "lyrics-ime-typing-engine";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioButton, RadioGroup } from "@/components/ui/radio-group/radio-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { cn } from "@/lib/tailwind";
import { getBuiltMap, useBuiltMapState } from "../../_lib/atoms/state";
import { store } from "../provider";

const userResultMapAtom = atom<Map<string, UserResult>>(new Map());

export const getUserResult = (id: string) => store.get(userResultMapAtom).get(id);

export const updateUserResult = (
  id: string,
  {
    name,
    typeCountDelta,
    newWordResults,
    nextWordIndex,
  }: { name: string; typeCountDelta: number; newWordResults: WordResult[]; nextWordIndex: number },
) => {
  const userResult = getUserResult(id);

  store.set(userResultMapAtom, (prev) =>
    new Map(prev).set(id, {
      name,
      typeCount: (userResult?.typeCount ?? 0) + typeCountDelta,
      wordResults: newWordResults,
      currentWordIndex: nextWordIndex,
    }),
  );
};

export const resetUserResultMap = () => store.set(userResultMapAtom, new Map());

const resultRankingAtom = atom((get) => {
  const userResults = get(userResultMapAtom);
  const map = getBuiltMap();
  if (!map) return [];
  const scored = [...userResults.values()]
    .sort((a, b) => b.typeCount - a.typeCount)
    .map(({ name, typeCount, wordResults, currentWordIndex }) => ({
      name,
      score: Math.round((1000 / map.totalNotes) * typeCount),
      wordResults,
      currentWordIndex,
    }));
  return scored.map((entry, _, arr) => ({
    ...entry,
    rank: arr.filter((e) => e.score > entry.score).length + 1,
  }));
});

export const useResultRanking = () => useAtomValue(resultRankingAtom);
export const getResultRanking = () => store.get(resultRankingAtom);

const resultDialogAtom = atom(false);

const useIsOpen = () => useAtomValue(resultDialogAtom);
export const openResultDialog = () => store.set(resultDialogAtom, true);
const closeResultDialog = () => store.set(resultDialogAtom, false);

export const ResultDialog = () => {
  const isOpen = useIsOpen();
  const resultRanking = useResultRanking();
  const [selectedResultIndex, setSelectedResultIndex] = useState<number>(0);

  const displayedResult = resultRanking[selectedResultIndex];
  return (
    <Dialog open={isOpen} onOpenChange={closeResultDialog}>
      <DialogContent className="max-h-[85vh] w-full min-w-screen xl:min-w-5xl">
        <DialogHeader>
          <DialogTitle>採点結果</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <ResultRanking
            resultRanking={resultRanking}
            selectedResultIndex={selectedResultIndex}
            onSelect={setSelectedResultIndex}
          />
          <div className="flex-1 space-y-4 overflow-hidden">
            {displayedResult && (
              <>
                <ResultStatus score={displayedResult.score} typeCount={displayedResult.wordResults.length} />
                <ResultWordsTable
                  wordResults={displayedResult.wordResults}
                  currentWordIndex={displayedResult.currentWordIndex}
                />
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const RANK_COLORS: Record<number, string> = {
  1: "text-perfect",
  2: "text-slate-300",
  3: "text-[#d97757]",
};

const ResultRanking = ({
  resultRanking,
  selectedResultIndex,
  onSelect,
}: {
  resultRanking: ReturnType<typeof useResultRanking>;
  selectedResultIndex: number;
  onSelect: (index: number) => void;
}) => {
  return (
    <RadioGroup
      value={String(selectedResultIndex)}
      onValueChange={(value) => onSelect(Number(value))}
      className="flex w-[170px] shrink-0 flex-col gap-px"
    >
      {resultRanking.map((userResult, index) => {
        const isPerfect = userResult.score === 1000;
        return (
          <RadioButton
            key={userResult.name}
            value={String(index)}
            variant="unstyled"
            className={cn(
              "group/ranking-item relative grid h-auto w-full grid-cols-[22px_1fr] items-center gap-2 whitespace-normal rounded-md px-2 py-[5px] transition-colors",
              "focus-visible:ring-0",
              "data-[state=checked]:bg-accent data-[state=unchecked]:hover:bg-accent/50",
            )}
          >
            <span className="absolute top-1.5 bottom-1.5 left-0 w-[3px] rounded-r-sm bg-primary-light opacity-0 transition-opacity group-data-[state=checked]/ranking-item:opacity-100" />
            <span
              className={cn(
                "text-center font-bold font-mono text-sm tabular-nums leading-none",
                RANK_COLORS[userResult.rank] ?? "text-foreground",
              )}
            >
              {userResult.rank}
            </span>
            <div className="flex min-w-0 flex-1 items-baseline gap-1.5">
              <span className="flex-1 truncate text-left font-medium text-xs">{userResult.name}</span>
              <span
                className={cn(
                  "shrink-0 font-bold font-mono text-[13px] tabular-nums",
                  isPerfect ? "text-perfect" : "text-foreground",
                )}
              >
                {userResult.score.toFixed(0)}
                <span
                  className={cn(
                    "ml-px font-medium text-[9px]",
                    isPerfect ? "text-perfect/85" : "text-muted-foreground",
                  )}
                >
                  点
                </span>
              </span>
            </div>
          </RadioButton>
        );
      })}
    </RadioGroup>
  );
};

const ResultStatus = ({ score, typeCount }: { score: number; typeCount: number }) => {
  const map = useBuiltMapState();
  const isPerfect = score === 1000;

  return (
    <div className="mb-2.5 flex items-center gap-[18px] rounded-lg border border-border/25 px-3.5 py-2.5">
      <div className="flex items-baseline gap-1.5">
        <span className="font-medium text-[11px] text-muted-foreground">スコア</span>
        <span
          className={cn(
            "font-bold font-mono text-[22px] tabular-nums leading-none",
            isPerfect ? "text-yellow-500" : "text-foreground",
          )}
        >
          {score}
          <span className="font-normal text-muted-foreground text-xs"> / 1000</span>
        </span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="font-medium text-[11px] text-muted-foreground">タイプ数</span>
        <span
          className={cn(
            "font-bold font-mono text-[22px] tabular-nums leading-none",
            isPerfect ? "text-yellow-500" : "text-foreground",
          )}
        >
          {typeCount}
          <span className="font-normal text-muted-foreground text-xs"> / {map?.totalNotes}</span>
        </span>
      </div>
    </div>
  );
};

const ResultWordsTable = ({ wordResults, currentWordIndex }: Pick<UserResult, "wordResults" | "currentWordIndex">) => {
  const map = useBuiltMapState();

  return (
    <div className="max-h-[60vh] overflow-auto rounded-lg border shadow-sm">
      <Table className="table-fixed text-xs">
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="w-16 px-2.5 py-1.5 text-center text-[11px] uppercase tracking-wider">判定</TableHead>
            <TableHead className="w-1/2 px-2.5 py-1.5 text-[11px] uppercase tracking-wider">入力</TableHead>
            <TableHead className="w-1/2 px-2.5 py-1.5 text-[11px] uppercase tracking-wider">歌詞</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wordResults.map((result, index) => {
            const isJudged = currentWordIndex > index || (currentWordIndex === index && result.evaluation !== "Skip");

            return (
              // biome-ignore lint/suspicious/noArrayIndexKey: 配列の長さ・順序が不変のため安全
              <TableRow key={index} className="even:bg-background/50 hover:bg-accent/30 [&>td]:px-2.5 [&>td]:py-2">
                <TableCell className="text-center">
                  {isJudged ? <EvaluationText evaluation={result.evaluation} /> : "-"}
                </TableCell>
                <TableCell className="whitespace-pre-wrap break-all leading-[1.4]">
                  {result.inputs.map((input, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: 配列の長さ・順序が不変のため安全
                    <div key={i}>{input}</div>
                  ))}
                </TableCell>
                <TableCell className="whitespace-pre-wrap break-all">
                  {result.evaluation !== "Great" && map?.flatWords[index]}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

const EvaluationText = ({ evaluation }: { evaluation: string }) => {
  if (evaluation === "Great") {
    return <span className="text-perfect text-xs outline-text">Great!</span>;
  }

  if (evaluation === "Good") {
    return <span className="text-success text-xs outline-text">Good</span>;
  }

  if (evaluation === "None") {
    return <span className="text-destructive text-xs outline-text">None</span>;
  }

  return <span className="text-foreground text-xs opacity-60 outline-text">Skip</span>;
};
