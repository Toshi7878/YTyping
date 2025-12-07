"use client";
import type { RefObject } from "react";
import { TableCell } from "@/components/ui/table/table";
import { cn } from "@/lib/utils";
import type { LabelType, StatusValueElementRefs } from "./status-table-card";

interface StatusCellProps {
  label: LabelType;
  statusValueRefs: StatusValueElementRefs;
}

export const StatusCell = ({ label, statusValueRefs }: StatusCellProps) => {
  const statusValueRef = statusValueRefs[label];

  return (
    <TableCell id={label} style={{ width: label === "score" || label === "point" ? "20%" : "14%" }}>
      <StatusLabel label={label} />
      <StatusUnderline label={label} />

      <span className="value text-6xl md:text-[2.2rem]">
        {label === "point" ? (
          <PointStatusValue pointValueRef={statusValueRef} timeBonusValueRef={statusValueRefs.timeBonus} />
        ) : (
          <StatusValue statusValueRef={statusValueRef} />
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
  pointValueRef: RefObject<HTMLSpanElement | null>;
  timeBonusValueRef: RefObject<HTMLSpanElement | null>;
}

const PointStatusValue = ({ pointValueRef, timeBonusValueRef }: PointStatusValueProps) => {
  return (
    <>
      <span ref={pointValueRef}>0</span>
      <small ref={timeBonusValueRef}></small>
    </>
  );
};

const StatusValue = ({ statusValueRef }: { statusValueRef: RefObject<HTMLSpanElement | null> }) => {
  return <span ref={statusValueRef}>0</span>;
};

const StatusUnderline = ({ label }: { label: LabelType }) => {
  const isMainWidth = label === "score" || label === "point";

  const underlineWidthClass = isMainWidth ? "w-[240px] md:w-[159px]" : "w-28 md:w-20";

  return (
    <span className="relative">
      <span
        id="status_underline"
        className={cn("bg-card-foreground absolute bottom-0 left-0.5 h-0.5", underlineWidthClass)}
      />
    </span>
  );
};
