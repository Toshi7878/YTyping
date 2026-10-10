"use client";

import { createColumnHelper } from "@tanstack/react-table";
import type { Route } from "next";
import { DataTable } from "@/ui/table/data-table";
import type { DataTableFeatures } from "@/ui/table/data-table-features";
import { LinkText } from "@/ui/typography";
import { ByUser } from "./by-user";

export interface Tool {
  title: string;
  description: string;
  href: string;
  byUserId: string;
}

const columnHelper = createColumnHelper<DataTableFeatures, Tool>();

const columns = columnHelper.columns([
  columnHelper.display({
    id: "title",
    header: "ツール名",
    size: 200,
    cell: ({ row }) => (
      <LinkText href={row.original.href as Route}>
        <span className="font-semibold">{row.original.title}</span>
      </LinkText>
    ),
    meta: {
      cellClassName: () => "whitespace-normal align-top py-3",
    },
  }),
  columnHelper.accessor("description", {
    header: "説明",
    size: 420,
    cell: (info) => info.getValue(),
    meta: {
      cellClassName: () => "whitespace-normal align-top py-3",
    },
  }),
  columnHelper.display({
    id: "author",
    header: "作成者",
    size: 110,
    cell: ({ row }) => <ByUser userId={row.original.byUserId} />,
    meta: {
      cellClassName: () => "whitespace-nowrap align-top py-3",
    },
  }),
]);

export function ToolsTable({ tools }: { tools: Tool[] }) {
  return <DataTable columns={columns} data={tools} />;
}
