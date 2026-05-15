"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { getReportStatusBadgeVariant, getReportStatusLabel } from "@/shared/user/report";
import { UserNameLinkText } from "@/shared/user/user-name-link";
import { useTRPC } from "@/trpc/provider";
import { Badge } from "@/ui/badge";
import { Card, CardContent, CardHeader } from "@/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/ui/table/table";
import { TooltipWrapper } from "@/ui/tooltip";
import { formatDate } from "@/utils/date";
import { ReportActions } from "./report-actions";

export const ReportList = () => {
  const trpc = useTRPC();
  const { data: reports } = useSuspenseQuery(trpc.user.report.list.queryOptions());

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
                <TableHead>対象ユーザー</TableHead>
                <TableHead>理由</TableHead>
                <TableHead>詳細</TableHead>
                <TableHead>日時</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => {
                const isReportedUserBanned = report.reportedUser?.banned ?? false;

                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Badge variant={getReportStatusBadgeVariant(report.status, isReportedUserBanned)}>
                        {getReportStatusLabel(report.status, isReportedUserBanned)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <UserNameLinkText
                        userId={report.reporterId}
                        userName={report.reporter?.name ?? `ID: ${report.reporterId}`}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <UserNameLinkText
                          userId={report.reportedUserId}
                          userName={report.reportedUser?.name ?? `ID: ${report.reportedUserId}`}
                        />
                        {(report.reportedUser?.warningCount ?? 0) > 0 && (
                          <Badge variant="warning">{report.reportedUser?.warningCount}回警告</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{report.reason}</TableCell>
                    <TableCell className="max-w-48 truncate text-muted-foreground">
                      <TooltipWrapper
                        label={report.reasonDetail}
                        className="whitespace-pre-wrap break-all"
                        align="start"
                      >
                        {report.reasonDetail}
                      </TooltipWrapper>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground text-xs">
                      {formatDate(report.createdAt)}
                    </TableCell>
                    <TableCell>
                      <ReportActions
                        reportId={report.id}
                        warningCount={report.reportedUser?.warningCount ?? 0}
                        showReviewActions={report.status === "PENDING"}
                        showUnbanAction={report.status === "RESOLVED" && isReportedUserBanned}
                      />
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
