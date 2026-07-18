"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { TriangleAlertIcon } from "lucide-react";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type z from "zod/v4";
import { REPORT_REASON_TYPES } from "@/server/drizzle/schema";
import { REPORT_REASON_LABELS } from "@/shared/user/report";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { SelectFormField, TextareaFormField } from "@/ui/form-field-item";
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

  const form = useForm<z.infer<typeof userReportFormSchema>>({
    resolver: zodResolver(userReportFormSchema),
    defaultValues: {
      reason: "CHEATING",
      reasonDetail: "",
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

  const onSubmit = (values: z.infer<typeof userReportFormSchema>) => {
    submitReport.mutate({
      reportedUserId,
      reason: values.reason,
      reasonDetail: values.reasonDetail,
    });
  };

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
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <SelectFormField
              name="reason"
              label="報告カテゴリ"
              defaultValue="CHEATING"
              options={REPORT_REASON_TYPES.map((v) => ({
                value: v,
                label: REPORT_REASON_LABELS[v],
              }))}
            />
            <TextareaFormField
              name="reasonDetail"
              label="報告理由"
              placeholder="詳細な理由を入力してください。"
              maxLength={500}
              required
              className="min-h-30"
            />
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
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
};
