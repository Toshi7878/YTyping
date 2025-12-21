import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import { useBuiltMapState, useStatusState, useWordResultsState } from "../../_lib/atoms/state";

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ResultDialog = ({ isOpen, onClose }: ResultDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] w-full lg:min-w-4xl">
        <DialogHeader>
          <DialogTitle>採点結果</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 overflow-hidden">
          <ResultStatus />
          <ResultWordsTable />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ResultStatus = () => {
  const status = useStatusState();
  const map = useBuiltMapState();

  const isPerfect = status.score === 1000;

  return (
    <section>
      <div className="mb-4 flex items-center justify-center gap-4 rounded-md border border-border/25 p-4 shadow-sm">
        <div className="min-w-[120px] text-center">
          <div className="font-semibold text-muted-foreground text-sm">スコア</div>
          <div className={cn("font-bold font-mono text-3xl", isPerfect ? "text-yellow-500" : "text-foreground")}>
            {status.score} <span className="font-normal text-base text-muted-foreground">/ 1000</span>
          </div>
        </div>
        <div className="min-w-[120px] text-center">
          <div className="font-semibold text-muted-foreground text-sm">タイプ数</div>
          <div className={cn("font-bold font-mono text-3xl", isPerfect ? "text-yellow-500" : "text-foreground")}>
            {status.typeCount} <span className="font-normal text-base text-muted-foreground">/ {map?.totalNotes}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const ResultWordsTable = () => {
  const wordResults = useWordResultsState();
  const map = useBuiltMapState();
  const status = useStatusState();

  return (
    <div className="max-h-[45vh] overflow-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead className="text-center">No.</TableHead>
            <TableHead className="text-center">判定</TableHead>
            <TableHead className="w-1/2">入力</TableHead>
            <TableHead className="w-1/2">歌詞</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wordResults.map((result, index) => {
            const isJudged = status.wordIndex > index || (status.wordIndex === index && result.evaluation !== "Skip");

            return (
              <TableRow key={`${index}-${result.inputs.join("")}`} className="[&>td]:py-2">
                <TableCell className="text-center font-mono">{index + 1}</TableCell>
                <TableCell className="text-center">
                  {isJudged ? <EvaluationText evaluation={result.evaluation} /> : "-"}
                </TableCell>
                <TableCell className="wrap-break-word px-4 leading-6">
                  <div className="space-y-1">
                    {result.inputs.map((input, i) => (
                      <div key={`${i}-${input}`} className="text-sm">
                        {input}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="wrap-break-word px-4">
                  <div className="text-sm">{result.evaluation !== "Great" && map?.textWords[index]}</div>
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
