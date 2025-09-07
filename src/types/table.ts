import "@tanstack/react-table";
import { Cell } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    cellClassName?: (cell: Cell<TData, unknown>, index: number) => string;

    headerClassName?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>, row: TData, index: number) => void;
  }
}
