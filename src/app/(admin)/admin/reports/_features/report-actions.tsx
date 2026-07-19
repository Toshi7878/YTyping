"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { z as zod } from "zod/v4";
import { useTRPC } from "@/trpc/provider";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { useAppForm } from "@/ui/form-field-item";

interface ReportActionsProps {
  reportId: number;
  warningCount: number;
  showReviewActions?: boolean;
  showUnbanAction?: boolean;
}

const WARNING_BAN_THRESHOLD = 3;

const banFormSchema = zod.object({
  banReason: zod.string().max(500),
  adminNote: zod.string().trim().min(1).max(1000),
});

const warnFormSchema = zod.object({
  warningComment: zod.string().trim().min(1).max(1000),
  adminNote: zod.string().trim().min(1).max(1000),
});

const noBanFormSchema = zod.object({
  adminNote: zod.string().max(1000),
});

const buildDefaultWarningComment = (warningCount: number) => {
  const nextWarningCount = warningCount + 1;
  const remainingCount = Math.max(WARNING_BAN_THRESHOLD - nextWarningCount, 0);

  return [
    "You have been warned for a potential violation of our terms of service.",
    `Warning count: ${nextWarningCount}.`,
    remainingCount > 0
      ? `Warnings remaining before ban: ${remainingCount}.`
      : `You will be banned if warnings exceed ${WARNING_BAN_THRESHOLD}.`,
  ].join("\n");
};

export const ReportActions = ({
  reportId,
  warningCount,
  showReviewActions = false,
  showUnbanAction = false,
}: ReportActionsProps) => {
  return (
    <div className="flex gap-2">
      {showReviewActions && (
        <>
          <BanDialog reportId={reportId} />
          {warningCount < WARNING_BAN_THRESHOLD - 1 && <WarnDialog reportId={reportId} warningCount={warningCount} />}
          <NoBanDialog reportId={reportId} />
        </>
      )}
      {showUnbanAction && <UnbanDialog reportId={reportId} />}
    </div>
  );
};

const BanDialog = ({ reportId }: { reportId: number }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const form = useAppForm({
    validators: { onChange: banFormSchema },
    defaultValues: { banReason: "", adminNote: "" },
    onSubmit: ({ value }) => {
      ban.mutate({
        reportId,
        adminNote: value.adminNote,
        banReason: value.banReason.trim() || undefined,
      });
    },
  });

  const ban = useMutation({
    ...trpc.user.report.ban.mutationOptions(),
    onSuccess: () => {
      toast.success("通報をBAN済みにしました");
      queryClient.invalidateQueries(trpc.user.report.list.queryOptions());
      form.reset();
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          BAN
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ユーザーをBANする</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <form.AppField name="banReason">
            {(field) => <field.TextareaFormField label="BAN理由（BANされたユーザーに表示）" rows={3} maxLength={500} />}
          </form.AppField>
          <form.AppField name="adminNote">
            {(field) => (
              <field.TextareaFormField
                label="管理者コメント（通報したユーザーに通知されます）"
                rows={3}
                maxLength={1000}
                required
              />
            )}
          </form.AppField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" variant="destructive" disabled={ban.isPending}>
              BANする
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const WarnDialog = ({ reportId, warningCount }: { reportId: number; warningCount: number }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const defaultWarningComment = buildDefaultWarningComment(warningCount);
  const form = useAppForm({
    validators: { onChange: warnFormSchema },
    defaultValues: { warningComment: defaultWarningComment, adminNote: "" },
    onSubmit: ({ value }) => {
      warn.mutate({ reportId, warningComment: value.warningComment, adminNote: value.adminNote });
    },
  });

  const warn = useMutation({
    ...trpc.user.report.warn.mutationOptions(),
    onSuccess: () => {
      toast.success("対象ユーザーに警告しました");
      queryClient.invalidateQueries(trpc.user.report.list.queryOptions());
      form.reset({ warningComment: defaultWarningComment, adminNote: "" });
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset({ warningComment: defaultWarningComment, adminNote: "" });
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="warning">
          警告
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>対象ユーザーに警告する</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <form.AppField name="warningComment">
            {(field) => (
              <field.TextareaFormField
                label="警告コメント（対象ユーザーに通知されます）"
                rows={5}
                maxLength={1000}
                required
              />
            )}
          </form.AppField>
          <form.AppField name="adminNote">
            {(field) => (
              <field.TextareaFormField
                label="管理者コメント（通報したユーザーに通知されます）"
                rows={3}
                maxLength={1000}
                required
              />
            )}
          </form.AppField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" variant="warning" disabled={warn.isPending}>
              警告する
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const NoBanDialog = ({ reportId }: { reportId: number }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const form = useAppForm({
    validators: { onChange: noBanFormSchema },
    defaultValues: { adminNote: "" },
    onSubmit: ({ value }) => {
      dismiss.mutate({ reportId, adminNote: value.adminNote.trim() || undefined });
    },
  });

  const dismiss = useMutation({
    ...trpc.user.report.dismiss.mutationOptions(),
    onSuccess: () => {
      toast.success("通報を対処不要にしました");
      queryClient.invalidateQueries(trpc.user.report.list.queryOptions());
      form.reset();
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          対処不要
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>BANせずに処理する</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <form.AppField name="adminNote">
            {(field) => (
              <field.TextareaFormField
                label="管理者コメント（入力した場合のみ、通報したユーザーに通知されます）"
                rows={3}
                maxLength={1000}
              />
            )}
          </form.AppField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={dismiss.isPending}>
              対処不要にする
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const UnbanDialog = ({ reportId }: { reportId: number }) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const unban = useMutation({
    ...trpc.user.report.unban.mutationOptions(),
    onSuccess: () => {
      toast.success("BANを解除しました");
      queryClient.invalidateQueries(trpc.user.report.list.queryOptions());
      setOpen(false);
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline-destructive">
          BAN解除
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>BANを解除する</DialogTitle>
        </DialogHeader>
        <p className="text-muted-foreground text-sm">対象ユーザーのBAN状態とBAN理由を解除します。</p>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={() => unban.mutate({ reportId })} disabled={unban.isPending}>
            BAN解除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
