"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { WarningIconButton } from "@/ui/icon-button";
import { TooltipWrapper } from "@/ui/tooltip";
import { formatDate } from "@/utils/date";

interface WarningDialogProps {
  userId: number;
  warningCount: number;
}

export const WarningDialog = ({ userId, warningCount }: WarningDialogProps) => {
  const t = useTranslations("user.warning");
  const { data: warnings } = useQuery(orpc.user.report.getWarnings.queryOptions({ input: { userId } }));

  if (warningCount === 0) return null;

  return (
    <Dialog>
      <TooltipWrapper label={t("tooltip")} asChild>
        <DialogTrigger render={<WarningIconButton />} />
      </TooltipWrapper>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          {warnings?.map((w, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: 静的なlistで使用する
            <div key={i} className="flex flex-col gap-1 rounded-md border p-3 text-sm">
              <p className="text-muted-foreground text-xs">{formatDate(w.createdAt)}</p>
              <p className="whitespace-pre-wrap">{w.notificationWarning?.comment}</p>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
