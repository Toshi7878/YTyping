"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/provider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { WarningIconButton } from "@/ui/icon-button";
import { TooltipWrapper } from "@/ui/tooltip";
import { formatDate } from "@/utils/date";

interface WarningDialogProps {
  userId: number;
  warningCount: number;
}

export const WarningDialog = ({ userId, warningCount }: WarningDialogProps) => {
  const trpc = useTRPC();
  const { data: warnings } = useQuery(trpc.user.report.getWarnings.queryOptions({ userId }));

  if (warningCount === 0) return null;

  return (
    <Dialog>
      <TooltipWrapper label="警告履歴を表示 (この表示は他のユーザーには表示されません)" asChild>
        <DialogTrigger asChild>
          <WarningIconButton />
        </DialogTrigger>
      </TooltipWrapper>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>警告履歴</DialogTitle>
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
