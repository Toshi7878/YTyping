"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (event: React.MouseEvent<HTMLTableRowElement>, row: TData, index: number) => void;
  selectedIndex?: number | null;
  timeLineIndex: number;
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  selectedIndex,
  timeLineIndex,
  className,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row, index) => (
              <TableRow
                key={row.id}
                data-state={selectedIndex === index ? "selected" : undefined}
                onClick={(event) => onRowClick?.(event, row.original, index)}
                className={cn(
                  onRowClick && "hover:bg-info/30 cursor-pointer",
                  timeLineIndex === index && "bg-success/30",
                  "data-[state=selected]:bg-info/70",
                )}
              >
                {row.getVisibleCells().map((cell) => {
                  const columnMeta = cell.column.columnDef.meta as
                    | { onClick?: (event: React.MouseEvent<HTMLDivElement>, row: TData, index: number) => void }
                    | undefined;
                  const hasColumnClick = columnMeta?.onClick;

                  return (
                    <TableCell
                      key={cell.id}
                      onClick={(event) => {
                        if (hasColumnClick) {
                          event.stopPropagation();
                          columnMeta!.onClick!(event, row.original, index);
                        }
                      }}
                      className={cn("border-r", hasColumnClick && "cursor-pointer")}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
