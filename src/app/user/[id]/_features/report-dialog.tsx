"use client";

import { useMutation } from "@tanstack/react-query";
import { TriangleAlertIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";
import type z from "zod/v4";
import { orpc } from "@/orpc/provider";
import { REPORT_REASON_TYPES } from "@/server/drizzle/schema";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { useAppForm } from "@/ui/form-field-item";
import { ReportIconButton } from "@/ui/icon-button";
import { toast } from "@/ui/toast";
import { TooltipWrapper } from "@/ui/tooltip";
import { userReportFormSchema } from "@/validator/user/report";

interface ReportDialogProps {
  reportedUserId: number;
  userName: string | null | undefined;
}

export const ReportDialog = ({ reportedUserId, userName }: ReportDialogProps) => {
  const t = useTranslations("user.report");
  const tReason = useTranslations("report.reasons");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);

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

  const submitReport = useMutation(
    orpc.user.report.submit.mutationOptions({
      onSuccess: () => {
        toast.success(t("success"));
        setOpen(false);
        form.reset();
      },
      onError: (error) => {
        toast.error(t("failed", { message: error.message }));
      },
    }),
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} disablePointerDismissal>
      <TooltipWrapper label={t("tooltip")} asChild>
        <DialogTrigger render={<ReportIconButton aria-label="Report" />} />
      </TooltipWrapper>
      <DialogContent className="max-w-sm">
        <div className="flex flex-col items-center gap-1 pb-2 text-center">
          <TriangleAlertIcon className="mb-1 size-10 text-destructive" />
          <DialogTitle className="text-xl">
            {userName ? t("titleNamed", { name: userName }) : t("titleUnnamed")}
          </DialogTitle>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="flex flex-col gap-4"
        >
          <form.AppField name="reason">
            {(field) => (
              <field.SelectFormField
                label={t("category")}
                options={REPORT_REASON_TYPES.map((v) => ({
                  value: v,
                  label: tReason(v),
                }))}
              />
            )}
          </form.AppField>
          <form.AppField name="reasonDetail">
            {(field) => (
              <field.TextareaFormField
                label={t("detail")}
                placeholder={t("placeholder")}
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
              {submitReport.isPending ? t("submitting") : t("submit")}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full rounded-full"
              onClick={() => handleOpenChange(false)}
            >
              {tCommon("cancel")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
