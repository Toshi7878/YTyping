import "@tanstack/react-table";
import type { Cell } from "@tanstack/react-table";
import type { MouseEvent } from "react";

declare module "@tanstack/react-table" {
  // biome-ignore lint/correctness/noUnusedVariables: TValue は react-table 本体との互換性のために宣言
  interface ColumnMeta<TData, TValue> {
    cellClassName?: (cell: Cell<TData, unknown>, index: number) => string;
    headerClassName?: string;
    onClick?: (event: MouseEvent<HTMLDivElement>, row: TData, index: number) => void;
  }
}
