"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createColumnHelper } from "@tanstack/react-table";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import { IMPORTANT_NOTICE_LEVEL_LABELS } from "@/shared/important-notice/level";
import { UserNameLinkText } from "@/shared/user/user-name-link";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { confirmDialog } from "@/ui/confirm-dialog";
import { DataTable } from "@/ui/table/data-table";
import type { DataTableFeatures } from "@/ui/table/data-table-features";
import { toast } from "@/ui/toast";
import { TooltipWrapper } from "@/ui/tooltip";
import { formatDate } from "@/utils/date";
import { ImportantNoticeForm } from "./important-notice-form";

type ImportantNotice = RouterOutputs["importantNotice"]["list"][number];

const columnHelper = createColumnHelper<DataTableFeatures, ImportantNotice>();

const isNoticeExpired = (notice: ImportantNotice) =>
  notice.expiresAt ? new Date(notice.expiresAt) <= new Date() : false;

export const ImportantNoticeList = () => {
  const queryClient = useQueryClient();
  const { data: notices } = useSuspenseQuery(orpc.importantNotice.list.queryOptions());

  const invalidate = () => queryClient.invalidateQueries(orpc.importantNotice.list.queryOptions());

  const expireNow = useMutation(
    orpc.importantNotice.expireNow.mutationOptions({
      onSuccess: () => {
        toast.success("お知らせを終了しました");
        invalidate();
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const deleteNotice = useMutation(
    orpc.importantNotice.delete.mutationOptions({
      onSuccess: () => {
        toast.success("お知らせを削除しました");
        invalidate();
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const handleDelete = async (noticeId: string, body: string) => {
    const confirmed = await confirmDialog.danger({
      title: "このお知らせを削除しますか？",
      description: `「${body.length > 30 ? `${body.slice(0, 30)}…` : body}」を削除します。この操作は取り消せません。`,
      confirmLabel: "削除する",
    });
    if (confirmed) deleteNotice.mutate({ noticeId });
  };

  const columns = columnHelper.columns([
    columnHelper.display({
      id: "status",
      header: "状態",
      size: 80,
      cell: ({ row }) => {
        const isExpired = isNoticeExpired(row.original);
        return <Badge variant={isExpired ? "outline" : "default"}>{isExpired ? "終了" : "配信中"}</Badge>;
      },
    }),
    columnHelper.display({
      id: "body",
      header: "内容",
      size: 320,
      cell: ({ row }) => {
        const notice = row.original;
        return (
          <TooltipWrapper
            label={notice.body}
            className="whitespace-pre-wrap break-all"
            align="start"
            delayDuration={300}
            asChild
          >
            <span className="flex items-center gap-1.5">
              {notice.level === "WARNING" ? (
                <Badge variant="outline" size="xs" className="shrink-0 border-warning text-warning">
                  {IMPORTANT_NOTICE_LEVEL_LABELS.WARNING}
                </Badge>
              ) : null}
              <span className="min-w-0 flex-1 truncate font-medium">{notice.body}</span>
            </span>
          </TooltipWrapper>
        );
      },
    }),
    columnHelper.display({
      id: "target",
      header: "対象",
      size: 192,
      cell: ({ row }) => {
        const notice = row.original;
        if (notice.audience === "ALL") return <Badge variant="secondary">全ユーザー</Badge>;

        return (
          <div className="flex gap-2 truncate">
            {notice.targets.map((target) => (
              <UserNameLinkText
                key={target.userId}
                userId={target.userId}
                userName={target.user?.name ?? `ID: ${target.userId}`}
              />
            ))}
          </div>
        );
      },
    }),
    columnHelper.accessor((notice) => notice.creator?.name ?? "-", {
      id: "creator",
      header: "作成者",
      size: 120,
      cell: (info) => <span className="block truncate text-muted-foreground text-xs">{info.getValue()}</span>,
    }),
    columnHelper.display({
      id: "expiresAt",
      header: "期限",
      size: 150,
      cell: ({ row }) => (
        <span className="text-muted-foreground text-xs">
          {row.original.expiresAt ? formatDate(row.original.expiresAt) : "無期限"}
        </span>
      ),
    }),
    columnHelper.display({
      id: "createdAt",
      header: "作成日時",
      size: 150,
      cell: ({ row }) => <span className="text-muted-foreground text-xs">{formatDate(row.original.createdAt)}</span>,
    }),
    columnHelper.display({
      id: "actions",
      header: "操作",
      size: 260,
      cell: ({ row }) => {
        const notice = row.original;
        return (
          <div className="flex gap-2">
            <ImportantNoticeForm notice={notice} />
            {!isNoticeExpired(notice) && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => expireNow.mutate({ noticeId: notice.id })}
                disabled={expireNow.isPending}
              >
                今すぐ終了
              </Button>
            )}
            <Button
              size="sm"
              variant="outline-destructive"
              onClick={() => handleDelete(notice.id, notice.body)}
              disabled={deleteNotice.isPending}
            >
              削除
            </Button>
          </div>
        );
      },
    }),
  ]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <span className="text-muted-foreground text-sm">全{notices.length}件</span>
        <ImportantNoticeForm />
      </CardHeader>
      <CardContent>
        {notices.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">重要なお知らせはありません</p>
        ) : (
          <DataTable columns={columns} data={notices} />
        )}
      </CardContent>
    </Card>
  );
};
