"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table"
import * as React from "react"

import { cn } from "@/lib/utils"
import Spinner from "../spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onRowClick?: (event: React.MouseEvent<HTMLTableRowElement>, row: TData, index: number) => void
  className?: string
  rowClassName?: (index: number) => string
  cellClassName?: string
  tbodyId?: string
  rowWrapper?: (args: { row: TData; index: number; children: React.ReactNode }) => React.ReactNode
  loading?: boolean
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onRowClick,
  className,
  rowClassName,
  cellClassName,
  tbodyId,
  rowWrapper,
  loading,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className={cn("overflow-hidden rounded-md border", className)}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    className={cn("text-card-foreground h-8", header.column.columnDef.meta?.headerClassName)}
                    key={header.id}
                    style={{ maxWidth: header.column.getSize(), minWidth: header.column.getSize() }}
                  >
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                )
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
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(event) => onRowClick?.(event, row.original, index)}
                  className={cn("transition-none", onRowClick && "cursor-pointer", rowClassName?.(index))}
                >
                  {row.getVisibleCells().map((cell) => {
                    const columnMeta = cell.column.columnDef.meta
                    const hasColumnClick = columnMeta?.onClick

                    return (
                      <TableCell
                        key={cell.id}
                        onClick={(event) => {
                          if (hasColumnClick) {
                            columnMeta?.onClick?.(event, row.original, index)
                          }
                        }}
                        style={{ maxWidth: cell.column.getSize(), minWidth: cell.column.getSize() }}
                        className={cn(
                          hasColumnClick && "cursor-pointer",
                          cellClassName,
                          columnMeta?.cellClassName?.(cell, index),
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  })}
                </TableRow>
              )

              if (rowWrapper) {
                return (
                  <React.Fragment key={row.id}>
                    {rowWrapper({ row: row.original, index, children: rowNode })}
                  </React.Fragment>
                )
              }

              return rowNode
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
