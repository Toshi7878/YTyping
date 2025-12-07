import { type RefObject, useEffect, useRef } from "react";
import { CardWithContent } from "@/components/ui/card";
import { Table, TableBody, TableRow } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import { setStatusElements } from "../../../_lib/atoms/status";
import { StatusCell } from "./status-cell";

export type LabelType = "score" | "type" | "kpm" | "rank" | "point" | "miss" | "lost" | "line";

export type StatusValueElementRefs = {
  [key in LabelType | "timeBonus"]: RefObject<HTMLSpanElement | null>;
};

export const StatusCard = ({ className }: { className: string }) => {
  const statusValueRefs = useRef<StatusValueElementRefs>({
    score: { current: null as HTMLSpanElement | null },
    type: { current: null as HTMLSpanElement | null },
    kpm: { current: null as HTMLSpanElement | null },
    rank: { current: null as HTMLSpanElement | null },
    point: { current: null as HTMLSpanElement | null },
    miss: { current: null as HTMLSpanElement | null },
    lost: { current: null as HTMLSpanElement | null },
    line: { current: null as HTMLSpanElement | null },
    timeBonus: { current: null as HTMLSpanElement | null },
  }).current;

  useEffect(() => {
    if (
      statusValueRefs.score.current &&
      statusValueRefs.type.current &&
      statusValueRefs.kpm.current &&
      statusValueRefs.rank.current &&
      statusValueRefs.point.current &&
      statusValueRefs.miss.current &&
      statusValueRefs.lost.current &&
      statusValueRefs.line.current &&
      statusValueRefs.timeBonus.current
    ) {
      setStatusElements({
        score: statusValueRefs.score.current,
        type: statusValueRefs.type.current,
        kpm: statusValueRefs.kpm.current,
        rank: statusValueRefs.rank.current,
        point: statusValueRefs.point.current,
        miss: statusValueRefs.miss.current,
        lost: statusValueRefs.lost.current,
        line: statusValueRefs.line.current,
        timeBonus: statusValueRefs.timeBonus.current,
      });
    }
  }, []);

  return (
    <CardWithContent
      id="tab-status-card"
      className={{
        card: cn("tab-card py-0", className),
        cardContent: "my-auto overflow-auto pl-16 md:pl-6",
      }}
    >
      <Table className="h-64 md:h-48 table-fixed overflow-hidden">
        <TableBody className="font-mono text-4xl font-bold md:text-[2rem]">
          <StatusTableRow labels={["score", "type", "kpm", "rank"]} statusValueRefs={statusValueRefs} />
          <StatusTableRow labels={["point", "miss", "lost", "line"]} statusValueRefs={statusValueRefs} />
        </TableBody>
      </Table>
    </CardWithContent>
  );
};

interface StatusTableRowProps {
  labels: LabelType[];
  statusValueRefs: StatusValueElementRefs;
}

const StatusTableRow = ({ labels, statusValueRefs }: StatusTableRowProps) => {
  return (
    <TableRow className="border-b-0 hover:bg-transparent">
      {labels.map((label) => (
        <StatusCell key={label} label={label} statusValueRefs={statusValueRefs} />
      ))}
    </TableRow>
  );
};
