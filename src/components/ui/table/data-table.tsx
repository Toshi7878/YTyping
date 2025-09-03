"use client";

import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowClick?: (event: React.MouseEvent<HTMLTableRowElement>, row: TData, index: number) => void;
  className?: string;
  rowClassName?: (index: number) => string;
  cellClassName?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  className,
  rowClassName,
  cellClassName,
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
                  <TableHead
                    className={cn("h-8", header.column.columnDef.meta?.headerClassName)}
                    key={header.id}
                    style={{ maxWidth: header.column.getSize(), minWidth: header.column.getSize() }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row, index) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
              onClick={(event) => onRowClick?.(event, row.original, index)}
              className={cn(onRowClick && "cursor-pointer", rowClassName?.(index))}
            >
              {row.getVisibleCells().map((cell) => {
                const columnMeta = cell.column.columnDef.meta;
                const hasColumnClick = columnMeta?.onClick;

                return (
                  <TableCell
                    key={cell.id}
                    onClick={(event) => {
                      if (hasColumnClick) {
                        columnMeta?.onClick?.(event, row.original, index);
                      }
                    }}
                    style={{ maxWidth: cell.column.getSize(), minWidth: cell.column.getSize() }}
                    className={cn(hasColumnClick && "cursor-pointer", cellClassName)}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
