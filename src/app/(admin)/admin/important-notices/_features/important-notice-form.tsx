"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useState } from "react";
import type z from "zod/v4";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import { IMPORTANT_NOTICE_LEVEL_LABELS } from "@/shared/important-notice/level";
import { Button } from "@/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/ui/dialog";
import { useAppForm } from "@/ui/form-field-item";
import { toast } from "@/ui/toast";
import { importantNoticeFormSchema } from "@/validator/important-notice";
import { UserMultiSelectFormField } from "./user-multi-select";

type FormValues = z.infer<typeof importantNoticeFormSchema>;

type ImportantNotice = RouterOutputs["importantNotice"]["list"][number];

const emptyValues: FormValues = {
  body: "",
  audience: "ALL",
  level: "INFO",
  linkUrl: "",
  linkLabel: "",
  targetUsers: [],
  expiresAt: "",
};

const buildFormValues = (notice?: ImportantNotice): FormValues => {
  if (!notice) return emptyValues;

  return {
    body: notice.body,
    audience: notice.audience,
    level: notice.level,
    linkUrl: notice.linkUrl ?? "",
    linkLabel: notice.linkLabel ?? "",
    targetUsers: notice.targets.map((target) => ({
      id: target.userId,
      name: target.user?.name ?? `ID: ${target.userId}`,
    })),
    // datetime-local はローカル時刻の "yyyy-MM-ddTHH:mm" 形式
    expiresAt: notice.expiresAt ? format(notice.expiresAt, "yyyy-MM-dd'T'HH:mm") : "",
  };
};

interface ImportantNoticeFormProps {
  /** 指定すると編集用になる。未指定なら新規作成 */
  notice?: ImportantNotice;
}

export const ImportantNoticeForm = ({ notice }: ImportantNoticeFormProps) => {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const isEdit = !!notice;

  const form = useAppForm({
    validators: { onChange: importantNoticeFormSchema },
    defaultValues: buildFormValues(notice),
    onSubmit: ({ value }) => {
      const payload = {
        body: value.body,
        audience: value.audience,
        level: value.level,
        linkUrl: value.linkUrl || undefined,
        linkLabel: value.linkLabel || undefined,
        targetUserIds: value.audience === "SPECIFIC" ? value.targetUsers.map((u) => u.id) : [],
        expiresAt: value.expiresAt ? new Date(value.expiresAt) : undefined,
      };

      if (notice) update.mutate({ noticeId: notice.id, ...payload });
      else create.mutate(payload);
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

  const update = useMutation(
    orpc.importantNotice.update.mutationOptions({
      onSuccess: async () => {
        toast.success("重要なお知らせを更新しました");
        await queryClient.invalidateQueries({ queryKey: orpc.importantNotice.key() });
        setOpen(false);
      },
      onError: (e) => toast.error(e.message),
    }),
  );

  const handleOpenChange = (next: boolean) => {
    // 開くたびに、最新のお知らせの内容（新規作成なら空）に戻す
    form.reset(buildFormValues(notice));
    setOpen(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button size="sm" variant="outline">
              編集
            </Button>
          ) : (
            <Button>新規作成</Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "重要なお知らせを編集" : "重要なお知らせを作成"}</DialogTitle>
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
            <Button type="submit" disabled={create.isPending || update.isPending}>
              {isEdit ? "更新する" : "作成する"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
