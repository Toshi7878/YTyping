"use client";

import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { orpc } from "@/orpc/provider";
import { UserNameLinkText } from "@/shared/user/user-name-link";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { confirmDialog } from "@/ui/confirm-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table/table";
import { toast } from "@/ui/toast";
import { TooltipWrapper } from "@/ui/tooltip";
import { formatDate } from "@/utils/date";

export const ResultReportList = () => {
  const { data: reports } = useSuspenseQuery(orpc.result.report.list.queryOptions());
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const onSettled = async () => {
    setPendingId(null);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: orpc.result.report.list.queryKey() }),
      queryClient.invalidateQueries({ queryKey: orpc.result.list.key() }),
    ]);
  };

  const invalidate = useMutation(
    orpc.result.report.invalidate.mutationOptions({
      onSuccess: () => toast.success("記録をBANしました"),
      onError: (e) => toast.error(e.message),
      onSettled,
    }),
  );
  const dismiss = useMutation(
    orpc.result.report.dismiss.mutationOptions({
      onSuccess: () => toast.success("対処不要にしました"),
      onError: (e) => toast.error(e.message),
      onSettled,
    }),
  );

  const handleInvalidate = async (reportId: number) => {
    const confirmed = await confirmDialog.danger({
      title: "この記録をBANしますか？",
      description: "記録を無効にし、ランキングとPPから外します。同じ記録への未処理の報告もまとめて解決済みになります。",
      confirmLabel: "BANする",
    });
    if (!confirmed) return;
    setPendingId(reportId);
    invalidate.mutate({ reportId });
  };

  const handleDismiss = (reportId: number) => {
    setPendingId(reportId);
    dismiss.mutate({ reportId });
  };

  const pendingCount = reports.filter((report) => report.status === "PENDING").length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <span className="text-muted-foreground text-sm">
          未処理 <strong className="text-destructive">{pendingCount}</strong> 件 / 全{reports.length} 件
        </span>
      </CardHeader>
      <CardContent>
        {reports.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">通報はありません</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ステータス</TableHead>
                <TableHead>通報者</TableHead>
                <TableHead>記録の持ち主</TableHead>
                <TableHead>譜面</TableHead>
                <TableHead>理由</TableHead>
                <TableHead>日時</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    {report.status === "PENDING" ? (
                      <Badge variant="outline">未処理</Badge>
                    ) : report.status === "DISMISSED" ? (
                      <Badge variant="secondary">対処不要</Badge>
                    ) : (
                      <Badge variant="destructive">{report.isInvalidated ? "BAN済み" : "BAN解除済み"}</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <UserNameLinkText
                      userId={report.reporterId}
                      userName={report.reporterName ?? `ID: ${report.reporterId}`}
                    />
                  </TableCell>
                  <TableCell>
                    <UserNameLinkText
                      userId={report.resultUserId}
                      userName={report.resultUserName ?? `ID: ${report.resultUserId}`}
                    />
                  </TableCell>
                  <TableCell className="max-w-48 truncate">
                    <Link href={`/type/${report.mapId}`} className="hover:underline">
                      {report.mapTitle}
                    </Link>
                  </TableCell>
                  <TableCell className="max-w-48 truncate text-muted-foreground">
                    <TooltipWrapper
                      label={report.reasonDetail}
                      className="whitespace-pre-wrap break-all"
                      align="start"
                      delayDuration={300}
                    >
                      {report.reasonDetail}
                    </TooltipWrapper>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                    {formatDate(report.createdAt)}
                  </TableCell>
                  <TableCell>
                    {report.status === "PENDING" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={pendingId === report.id}
                          onClick={() => handleInvalidate(report.id)}
                        >
                          BAN
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pendingId === report.id}
                          onClick={() => handleDismiss(report.id)}
                        >
                          対処不要
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};
