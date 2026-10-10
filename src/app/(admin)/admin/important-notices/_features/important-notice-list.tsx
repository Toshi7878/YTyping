"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { orpc } from "@/orpc/provider";
import { IMPORTANT_NOTICE_LEVEL_LABELS } from "@/shared/important-notice/level";
import { UserNameLinkText } from "@/shared/user/user-name-link";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { confirmDialog } from "@/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table/table";
import { toast } from "@/ui/toast";
import { TooltipWrapper } from "@/ui/tooltip";
import { formatDate } from "@/utils/date";
import { ImportantNoticeForm } from "./important-notice-form";

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

  const handleDelete = async (noticeId: string, title: string) => {
    const confirmed = await confirmDialog.danger({
      title: "このお知らせを削除しますか？",
      description: `「${title}」を削除します。この操作は取り消せません。`,
      confirmLabel: "削除する",
    });
    if (confirmed) deleteNotice.mutate({ noticeId });
  };

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>状態</TableHead>
                <TableHead>タイトル</TableHead>
                <TableHead>対象</TableHead>
                <TableHead>作成者</TableHead>
                <TableHead>期限</TableHead>
                <TableHead>作成日時</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notices.map((notice) => {
                const isExpired = notice.expiresAt ? new Date(notice.expiresAt) <= new Date() : false;

                return (
                  <TableRow key={notice.id}>
                    <TableCell>
                      <Badge variant={isExpired ? "outline" : "default"}>{isExpired ? "終了" : "配信中"}</Badge>
                    </TableCell>
                    <TableCell className="max-w-56">
                      <TooltipWrapper
                        label={notice.body}
                        className="whitespace-pre-wrap break-all"
                        align="start"
                        delayDuration={300}
                      >
                        <span className="flex items-center gap-1.5">
                          {notice.level === "WARNING" ? (
                            <Badge variant="outline" size="xs" className="shrink-0 border-warning text-warning">
                              {IMPORTANT_NOTICE_LEVEL_LABELS.WARNING}
                            </Badge>
                          ) : null}
                          <span className="block truncate font-medium">{notice.title}</span>
                        </span>
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell className="max-w-48">
                      {notice.audience === "ALL" ? (
                        <Badge variant="secondary">全ユーザー</Badge>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {notice.targets.map((target) => (
                            <UserNameLinkText
                              key={target.userId}
                              userId={target.userId}
                              userName={target.user?.name ?? `ID: ${target.userId}`}
                            />
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {notice.creator?.name ?? "-"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {notice.expiresAt ? formatDate(notice.expiresAt) : "無期限"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {formatDate(notice.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!isExpired && (
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
                          onClick={() => handleDelete(notice.id, notice.title)}
                          disabled={deleteNotice.isPending}
                        >
                          削除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
