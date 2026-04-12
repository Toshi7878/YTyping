import { CardWithContent } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import { StatusCell } from "./status-cell";

export type LabelType = "score" | "type" | "kpm" | "rank" | "point" | "miss" | "lost" | "line";

export const StatusCard = ({ className }: { className: string }) => {
  return (
    <CardWithContent
      id="tab-status-card"
      className={{
        card: cn("tab-card py-0", className),
        cardContent: "my-auto overflow-auto pr-0 max-md:pl-[8%]",
      }}
    >
      <Table className="h-64 table-fixed overflow-hidden md:h-48">
        <TableBody className="font-bold font-mono text-4xl md:text-[2rem]">
          <StatusTableRow labels={["score", "type", "kpm", "rank"]} />
          <StatusTableRow labels={["point", "miss", "lost", "line"]} />
        </TableBody>
      </Table>
    </CardWithContent>
  );
};

interface StatusTableRowProps {
  labels: LabelType[];
}

const StatusTableRow = ({ labels }: StatusTableRowProps) => {
  return (
    <TableRow className="border-b-0 hover:bg-transparent">
      {labels.map((label) => (
        <StatusCell key={label} label={label} />
      ))}
    </TableRow>
  );
};
