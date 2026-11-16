"use client";

import { useQuery } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("user.noticeHistory");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const { data: notices, isLoading } = useQuery(
    orpc.importantNotice.getHistory.queryOptions({ input: { userId }, enabled: open }),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <TooltipWrapper label={t("tooltip")} asChild>
        <DialogTrigger render={<ImportantNoticeIconButton />} />
      </TooltipWrapper>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {isLoading ? <p className="text-muted-foreground text-sm">{tCommon("loading")}</p> : null}
          {notices && notices.length === 0 ? (
            <p className="py-4 text-center text-muted-foreground text-sm">{t("empty")}</p>
          ) : null}
          {notices?.map((notice) => {
            const isExpired = notice.expiresAt ? notice.expiresAt <= new Date() : false;

            return (
              <div key={notice.id} className="flex flex-col gap-1 rounded-md border p-3 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <p className="flex items-center gap-1.5 text-muted-foreground text-xs">
                    {notice.level === "WARNING" ? (
                      <TriangleAlert className="size-4 shrink-0 text-warning" aria-label="Warning" />
                    ) : null}
                    {formatDate(notice.createdAt)}
                    {notice.acknowledgedAt ? t("acknowledgedAt", { date: formatDate(notice.acknowledgedAt) }) : ""}
                  </p>
                  {notice.acknowledgedAt ? (
                    <Badge variant="secondary">{t("acknowledged")}</Badge>
                  ) : isExpired ? (
                    <Badge variant="outline">{t("expired")}</Badge>
                  ) : (
                    <Badge variant="default">{t("unacknowledged")}</Badge>
                  )}
                </div>
                <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{notice.body}</p>
                <ImportantNoticeLinkButton linkUrl={notice.linkUrl} linkLabel={notice.linkLabel} className="mt-1" />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
