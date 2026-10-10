"use client";

import type { Cell, CellData, ColumnDef, RowData, TableFeatures } from "@tanstack/react-table";
import { useTable } from "@tanstack/react-table";
import type { MouseEvent } from "react";
import * as React from "react";

import { cn } from "@/utils/cn";
import { Spinner } from "../spinner";
import { type DataTableFeatures, dataTableFeatures } from "./data-table-features";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

type DataTableColumnDef<TData extends RowData> = ColumnDef<DataTableFeatures, TData>;

declare module "@tanstack/react-table" {
  interface ColumnMeta<
    in out TFeatures extends TableFeatures,
    in out TData extends RowData,
    TValue extends CellData = CellData,
  > {
    cellClassName?: (cell: Cell<TFeatures, TData, TValue>, index: number) => string;
    headerClassName?: string;
    onClick?: (event: MouseEvent<HTMLDivElement>, row: TData, index: number) => void;
  }
}

interface DataTableProps<TData extends RowData> {
  columns: DataTableColumnDef<TData>[];
  data: TData[];
  onRowClick?: (event: React.MouseEvent<HTMLTableRowElement>, row: TData, index: number) => void;
  className?: string;
  rowClassName?: (index: number) => string;
  cellClassName?: string;
  tbodyId?: string;
  headerRowClassName?: string;
  rowWrapper?: (args: { row: TData; index: number; children: React.ReactNode }) => React.ReactNode;
  loading?: boolean;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  onRowClick,
  className,
  rowClassName,
  cellClassName,
  tbodyId,
  headerRowClassName,
  rowWrapper,
  loading,
}: DataTableProps<TData>) {
  const table = useTable({ features: dataTableFeatures, columns, data });

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className={cn("hover:bg-transparent", headerRowClassName)}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    className={cn("h-8 text-card-foreground", header.column.columnDef.meta?.headerClassName)}
                    key={header.id}
                    style={{ maxWidth: header.column.getSize(), minWidth: header.column.getSize() }}
                  >
                    {header.isPlaceholder ? null : <table.FlexRender header={header} />}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody id={tbodyId}>
          {loading ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={columns.length} className="h-40 text-center">
                <Spinner size="lg" />
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row, index) => {
              const rowNode = (
                <TableRow
                  key={row.id}
                  onClick={(event) => onRowClick?.(event, row.original, index)}
                  className={cn("transition-none", onRowClick && "cursor-pointer", rowClassName?.(index))}
                >
                  {row.getAllCells().map((cell) => {
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
                        className={cn(
                          hasColumnClick && "cursor-pointer",
                          cellClassName,
                          columnMeta?.cellClassName?.(cell, index),
                        )}
                      >
                        <table.FlexRender cell={cell} />
                      </TableCell>
                    );
                  })}
                </TableRow>
              );

              if (rowWrapper) {
                return (
                  <React.Fragment key={row.id}>
                    {rowWrapper({ row: row.original, index, children: rowNode })}
                  </React.Fragment>
                );
              }

              return rowNode;
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
