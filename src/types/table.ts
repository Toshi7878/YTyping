import "@tanstack/react-table";
import type { Cell } from "@tanstack/react-table";
import type { MouseEvent } from "react";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    cellClassName?: (cell: Cell<TData, unknown>, index: number) => string;
    headerClassName?: string;
    onClick?: (event: MouseEvent<HTMLDivElement>, row: TData, index: number) => void;
  }
}
