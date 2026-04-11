"use client";
import { type Atom, useStore } from "jotai";
import { uncontrolled } from "jotai-uncontrolled";
import { TableCell } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import { typingStatusDisplayAtoms } from "../../../_lib/atoms/status";
import type { LabelType } from "./status-table-card";

interface StatusCellProps {
  label: LabelType;
}

export const StatusCell = ({ label }: StatusCellProps) => {
  const atom = typingStatusDisplayAtoms[label];

  return (
    <TableCell id={label} style={{ width: label === "score" || label === "point" ? "20%" : "14%" }}>
      <StatusLabel label={label} />
      <StatusUnderline label={label} />

      <span className="value text-6xl md:text-[2.2rem]">
        {label === "point" ? (
          <PointStatusValue
            pointAtom={typingStatusDisplayAtoms.point}
            timeBonusAtom={typingStatusDisplayAtoms.timeBonus}
          />
        ) : (
          <StatusValue atom={atom} />
        )}
      </span>
    </TableCell>
  );
};

const StatusLabel = ({ label }: { label: LabelType }) => {
  return (
    <span className={cn("status-label relative mr-2 capitalize md:text-[80%]", label === "kpm" && "tracking-[0.2em]")}>
      {label}
    </span>
  );
};

interface PointStatusValueProps {
  pointAtom: Atom<number>;
  timeBonusAtom: Atom<string>;
}

const PointStatusValue = ({ pointAtom, timeBonusAtom }: PointStatusValueProps) => {
  const store = useStore();
  return (
    <>
      <uncontrolled.span atomStore={store}>{pointAtom}</uncontrolled.span>
      <uncontrolled.small atomStore={store}>{timeBonusAtom}</uncontrolled.small>
    </>
  );
};

const StatusValue = ({ atom }: { atom: Atom<number> }) => {
  const store = useStore();
  return <uncontrolled.span atomStore={store}>{atom}</uncontrolled.span>;
};

const StatusUnderline = ({ label }: { label: LabelType }) => {
  const isMainWidth = label === "score" || label === "point";

  const underlineWidthClass = isMainWidth ? "w-[240px] md:w-[159px]" : "w-28 md:w-20";

  return (
    <span className="relative">
      <span
        id="status_underline"
        className={cn("absolute bottom-0 left-0.5 h-0.5 bg-card-foreground", underlineWidthClass)}
      />
    </span>
  );
};
