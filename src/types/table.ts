import "@tanstack/react-table";

declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends unknown, TValue> {
    headerClassName?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>, row: TData, index: number) => void;
  }
}
