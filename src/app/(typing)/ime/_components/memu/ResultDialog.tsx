import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useMapState, useStatusState, useWordResultsState } from "../../_lib/atoms/stateAtoms";

const ResultStatus = () => {
  const status = useStatusState();
  const map = useMapState();

  const isPerfect = status.score === 1000;

  return (
    <section>
      <div className="border-border/25 mb-4 flex items-center justify-center gap-4 rounded-md border p-4 shadow-sm">
        <div className="min-w-[120px] text-center">
          <div className="text-muted-foreground text-sm font-semibold">スコア</div>
          <div className={cn("font-mono text-3xl font-bold", isPerfect ? "text-yellow-500" : "text-foreground")}>
            {status.score} <span className="text-muted-foreground text-base font-normal">/ 1000</span>
          </div>
        </div>
        <div className="min-w-[120px] text-center">
          <div className="text-muted-foreground text-sm font-semibold">タイプ数</div>
          <div className={cn("font-mono text-3xl font-bold", isPerfect ? "text-yellow-500" : "text-foreground")}>
            {status.typeCount} <span className="text-muted-foreground text-base font-normal">/ {map?.totalNotes}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

const TD_WIDTHS = {
  No: "5%",
  Evaluation: "5%",
  Input: "45%",
  Song: "45%",
};

const ResultWordsTable = () => {
  const wordResults = useWordResultsState();
  const map = useMapState();
  const status = useStatusState();

  return (
    <div className="max-h-[45vh] overflow-y-auto rounded-lg border shadow-sm">
      <Table>
        <TableHeader className="bg-background sticky top-0 z-10 py-4">
          <TableRow>
            <TableHead className="text-center" style={{ width: TD_WIDTHS.No }}>
              No.
            </TableHead>
            <TableHead className="text-center" style={{ width: TD_WIDTHS.Evaluation }}>
              判定
            </TableHead>
            <TableHead style={{ width: TD_WIDTHS.Input }}>入力</TableHead>
            <TableHead style={{ width: TD_WIDTHS.Song }}>歌詞</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {wordResults.map((result, index) => {
            const isJudged = status.wordIndex > index || (status.wordIndex === index && result.evaluation !== "Skip");

            return (
              <TableRow key={index} className="[&>td]:py-3">
                <TableCell className="text-center font-mono" style={{ width: TD_WIDTHS.No }}>
                  {index + 1}
                </TableCell>
                <TableCell className="text-center" style={{ width: TD_WIDTHS.Evaluation }}>
                  {isJudged ? <EvaluationText evaluation={result.evaluation} /> : "-"}
                </TableCell>
                <TableCell style={{ width: TD_WIDTHS.Input }} className="leading-6">
                  {result.inputs.map((input, i) => (
                    <div key={i}>{input}</div>
                  ))}
                </TableCell>
                <TableCell style={{ width: TD_WIDTHS.Song }}>
                  {result.evaluation !== "Great" && map?.textWords[index]}
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
    return <span className="outline-text text-yellow-500">Great!</span>;
  }

  if (evaluation === "Good") {
    return <span className="outline-text text-blue-400">Good</span>;
  }

  if (evaluation === "None") {
    return <span className="outline-text text-red-500">None</span>;
  }

  return <span className="outline-text text-foreground opacity-60">Skip</span>;
};

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResultDialog = ({ isOpen, onClose }: ResultDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[80vh] max-w-6xl">
        <DialogHeader>
          <DialogTitle>採点結果</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <ResultStatus />
          <ResultWordsTable />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ResultDialog;
