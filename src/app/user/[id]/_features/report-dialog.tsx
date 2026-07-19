"use client";

import { useMutation } from "@tanstack/react-query";
import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type z from "zod/v4";
import { REPORT_REASON_TYPES } from "@/server/drizzle/schema";
import { REPORT_REASON_LABELS } from "@/shared/user/report";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { useAppForm } from "@/ui/form-field-item";
import { ReportIconButton } from "@/ui/icon-button";
import { TooltipWrapper } from "@/ui/tooltip";
import { userReportFormSchema } from "@/validator/user/report";

interface ReportDialogProps {
  reportedUserId: number;
  userName: string | null | undefined;
}

export const ReportDialog = ({ reportedUserId, userName }: ReportDialogProps) => {
  const [open, setOpen] = useState(false);
  const trpc = useTRPC();

  const form = useAppForm({
    validators: { onChange: userReportFormSchema },
    defaultValues: {
      reason: "CHEATING",
      reasonDetail: "",
    } as z.infer<typeof userReportFormSchema>,
    onSubmit: ({ value }) => {
      submitReport.mutate({
        reportedUserId,
        reason: value.reason,
        reasonDetail: value.reasonDetail,
      });
    },
  });

  const submitReport = useMutation({
    ...trpc.user.report.submit.mutationOptions(),
    onSuccess: () => {
      toast.success("報告を送信しました");
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(`報告に失敗しました: ${error.message}`);
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <TooltipWrapper label="このユーザーを報告" asChild>
        <DialogTrigger asChild>
          <ReportIconButton aria-label="報告" />
        </DialogTrigger>
      </TooltipWrapper>
      <DialogContent disableOutsideClick className="max-w-sm">
        <div className="flex flex-col items-center gap-1 pb-2 text-center">
          <TriangleAlertIcon className="mb-1 size-10 text-destructive" />
          <DialogTitle className="text-xl">{userName ? `${userName}` : "このユーザー"}を報告しますか？</DialogTitle>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.AppField name="reason">
            {(field) => (
              <field.SelectFormField
                label="報告カテゴリ"
                options={REPORT_REASON_TYPES.map((v) => ({
                  value: v,
                  label: REPORT_REASON_LABELS[v],
                }))}
              />
            )}
          </form.AppField>
          <form.AppField name="reasonDetail">
            {(field) => (
              <field.TextareaFormField
                label="報告理由"
                placeholder="詳細な理由を入力してください。"
                maxLength={500}
                required
                className="min-h-30"
              />
            )}
          </form.AppField>
          <div className="mt-2 flex flex-col gap-2">
            <Button
              type="submit"
              variant="destructive"
              className="w-full rounded-full"
              disabled={submitReport.isPending}
            >
              {submitReport.isPending ? "送信中..." : "レポートの送信"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              キャンセル
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
