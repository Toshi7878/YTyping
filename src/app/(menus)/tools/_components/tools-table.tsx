"use client";

import type { ColumnDef } from "@tanstack/react-table";
import type { Route } from "next";
import { DataTable } from "@/ui/table/data-table";
import { LinkText } from "@/ui/typography";
import { ByUser } from "./by-user";

export interface Tool {
  title: string;
  description: string;
  href: string;
  byUserId: string;
}

export function ToolsTable({ tools }: { tools: Tool[] }) {
  const columns: ColumnDef<Tool, unknown>[] = [
    {
      id: "title",
      header: () => "ツール名",
      size: 200,
      cell: ({ row }) => (
        <LinkText href={row.original.href as Route}>
          <span className="font-semibold">{row.original.title}</span>
        </LinkText>
      ),
      meta: {
        cellClassName: () => "whitespace-normal align-top py-3",
      },
    },
    {
      id: "description",
      header: () => "説明",
      size: 420,
      cell: ({ row }) => row.original.description,
      meta: {
        cellClassName: () => "whitespace-normal align-top py-3",
      },
    },
    {
      id: "author",
      header: () => "作成者",
      size: 110,
      cell: ({ row }) => <ByUser userId={row.original.byUserId} />,
      meta: {
        cellClassName: () => "whitespace-nowrap align-top py-3",
      },
    },
  ];

  return <DataTable columns={columns} data={tools} />;
}
