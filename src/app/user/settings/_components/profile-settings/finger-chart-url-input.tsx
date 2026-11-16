"use client";

import { useMutation } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import { useAppForm } from "@/ui/form-field-item";
import { FingerChartUrlFormSchema } from "@/validator/user/profile";

interface FingerChartUrlInputProps {
  url: string;
}

export const FingerChartUrlInput = ({ url }: FingerChartUrlInputProps) => {
  const t = useTranslations("userSettings");
  const form = useAppForm({
    validators: { onChange: FingerChartUrlFormSchema },
    defaultValues: { url },
  });
  const update = useMutation(orpc.user.profile.upsertFingerChartUrl.mutationOptions());

  return (
    <div className="flex flex-col gap-2">
      <form.AppField name="url">
        {(field) => (
          <field.MutationInputFormField
            className="w-md"
            label={t("fingerChartLabel")}
            placeholder={t("fingerChartPlaceholder")}
            successMessage={t("fingerChartUpdated")}
            mutation={update}
          />
        )}
      </form.AppField>
      <UnsiLink />
    </div>
  );
};

const UnsiLink = () => {
  const t = useTranslations("userSettings");

  return (
    <Link
      href="http://unsi.nonip.net"
      target="_blank"
      className="flex w-fit items-center gap-1 text-muted-foreground text-xs opacity-70 transition-opacity hover:opacity-100"
    >
      {t("fingerChartCreate")}
      <ExternalLink className="h-3 w-3" />
    </Link>
  );
};
