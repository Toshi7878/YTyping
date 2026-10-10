"use client";

import { useQuery } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { orpc } from "@/orpc/provider";
import { ImportantNoticeLinkButton } from "@/shared/important-notice/link-button";
import { Badge } from "@/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { ImportantNoticeIconButton } from "@/ui/icon-button";
import { TooltipWrapper } from "@/ui/tooltip";
import { formatDate } from "@/utils/date";

interface ImportantNoticeHistoryDialogProps {
  userId: number;
}

export const ImportantNoticeHistoryDialog = ({ userId }: ImportantNoticeHistoryDialogProps) => {
  const [open, setOpen] = useState(false);
  const { data: notices, isLoading } = useQuery(
    orpc.importantNotice.getHistory.queryOptions({ input: { userId }, enabled: open }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipWrapper label="重要なお知らせ履歴を表示 (この表示は他のユーザーには表示されません)" asChild>
        <DialogTrigger render={<ImportantNoticeIconButton />} />
      </TooltipWrapper>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>重要なお知らせ履歴</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {isLoading ? <p className="text-muted-foreground text-sm">読み込み中...</p> : null}
          {notices && notices.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">重要なお知らせはありません</p>
          ) : null}
          {notices?.map((notice) => {
            const isExpired = notice.expiresAt ? notice.expiresAt <= new Date() : false;

            return (
              <div key={notice.id} className="flex flex-col gap-1 rounded-md border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    {notice.level === "WARNING" ? (
                      <TriangleAlert className="size-4 shrink-0 text-warning" aria-label="警告" />
                    ) : null}
                    {formatDate(notice.createdAt)}
                    {notice.acknowledgedAt ? ` / 確認: ${formatDate(notice.acknowledgedAt)}` : ""}
                  </p>
                  {notice.acknowledgedAt ? (
                    <Badge variant="secondary">確認済み</Badge>
                  ) : isExpired ? (
                    <Badge variant="outline">期限切れ</Badge>
                  ) : (
                    <Badge variant="default">未確認</Badge>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words">{notice.body}</p>
                <ImportantNoticeLinkButton linkUrl={notice.linkUrl} linkLabel={notice.linkLabel} className="mt-1" />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
