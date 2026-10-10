"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type z from "zod/v4";
import { orpc } from "@/orpc/provider";
import { IMPORTANT_NOTICE_LEVEL_LABELS } from "@/shared/important-notice/level";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { useAppForm } from "@/ui/form-field-item";
import { toast } from "@/ui/toast";
import { importantNoticeFormSchema } from "@/validator/important-notice";
import { UserMultiSelectFormField } from "./user-multi-select";

type FormValues = z.infer<typeof importantNoticeFormSchema>;

const defaultValues: FormValues = {
  body: "",
  audience: "ALL",
  level: "INFO",
  linkUrl: "",
  linkLabel: "",
  targetUsers: [],
  expiresAt: "",
};

export const ImportantNoticeForm = () => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useAppForm({
    validators: { onChange: importantNoticeFormSchema },
    defaultValues,
    onSubmit: ({ value }) => {
      create.mutate({
        body: value.body,
        audience: value.audience,
        level: value.level,
        linkUrl: value.linkUrl || undefined,
        linkLabel: value.linkLabel || undefined,
        targetUserIds: value.audience === "SPECIFIC" ? value.targetUsers.map((u) => u.id) : [],
        expiresAt: value.expiresAt ? new Date(value.expiresAt) : undefined,
      });
    },
  });

  const create = useMutation(
    orpc.importantNotice.create.mutationOptions({
      onSuccess: () => {
        toast.success("重要なお知らせを作成しました");
        queryClient.invalidateQueries(orpc.importantNotice.list.queryOptions());
        form.reset();
        setOpen(false);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button>新規作成</Button>} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>重要なお知らせを作成</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="flex flex-col gap-3"
        >
          <form.AppField name="body">
            {(field) => <field.TextareaFormField label="本文" rows={5} maxLength={2000} required />}
          </form.AppField>
          <form.AppField name="level">
            {(field) => (
              <field.SelectFormField
                label="種類"
                options={[
                  { value: "INFO", label: IMPORTANT_NOTICE_LEVEL_LABELS.INFO },
                  { value: "WARNING", label: `${IMPORTANT_NOTICE_LEVEL_LABELS.WARNING}（目立つ色で表示）` },
                ]}
              />
            )}
          </form.AppField>
          <form.AppField name="linkUrl">
            {(field) => (
              <field.InputFormField
                label="リンク先（任意）"
                maxLength={1024}
                placeholder="/contact または https://..."
                description="サイト内のパスか https:// から始まる URL。お知らせカードにリンクボタンが表示されます"
              />
            )}
          </form.AppField>
          <form.AppField name="linkLabel">
            {(field) => (
              <field.InputFormField label="ボタンの文言（任意）" maxLength={100} placeholder="詳細はこちら" />
            )}
          </form.AppField>
          <form.AppField name="audience">
            {(field) => (
              <field.SelectFormField
                label="送信対象"
                options={[
                  { value: "ALL", label: "全ユーザー" },
                  { value: "SPECIFIC", label: "特定のユーザー" },
                ]}
              />
            )}
          </form.AppField>
          <form.Subscribe selector={(state) => state.values.audience}>
            {(audience) =>
              audience === "SPECIFIC" && (
                <form.AppField name="targetUsers">
                  {() => (
                    <UserMultiSelectFormField
                      label="対象ユーザー"
                      description="ユーザー名で検索して1人以上選択してください"
                    />
                  )}
                </form.AppField>
              )
            }
          </form.Subscribe>
          <form.AppField name="expiresAt">
            {(field) => (
              <field.InputFormField
                type="datetime-local"
                label="表示期限（任意）"
                description="指定しない場合は手動で終了するまで表示され続けます"
              />
            )}
          </form.AppField>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit" disabled={create.isPending}>
              作成する
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
