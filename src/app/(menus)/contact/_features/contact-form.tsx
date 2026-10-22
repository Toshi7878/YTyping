"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import { Button } from "@/ui/button";
import { useAppForm } from "@/ui/form-field-item";
import { toast } from "@/ui/toast";
import { contactCreateSchema } from "@/validator/contact";

export const ContactForm = () => {
  const t = useTranslations("contactPage");
  const queryClient = useQueryClient();

  const create = useMutation(
    orpc.contact.create.mutationOptions({
      onSuccess: async () => {
        toast.success(t("sent"));
        form.reset();
        await queryClient.invalidateQueries({ queryKey: orpc.contact.listMine.key() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  const form = useAppForm({
    validators: { onChange: contactCreateSchema },
    defaultValues: { body: "" },
    onSubmit: ({ value }) => create.mutate(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        void form.handleSubmit();
      }}
      className="flex flex-col gap-3"
    >
      <form.AppField name="body">
        {(field) => <field.TextareaFormField label={t("body")} rows={6} maxLength={2000} required />}
      </form.AppField>
      <div className="flex justify-end">
        <Button type="submit" disabled={create.isPending}>
          {t("submit")}
        </Button>
      </div>
    </form>
  );
};
