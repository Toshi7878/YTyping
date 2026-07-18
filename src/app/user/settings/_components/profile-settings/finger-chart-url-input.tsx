"use client";

import { useMutation } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useTRPC } from "@/trpc/provider";
import { useAppForm } from "@/ui/form-field-item";
import { FingerChartUrlFormSchema } from "@/validator/user/profile";

interface FingerChartUrlInputProps {
  url: string;
}

export const FingerChartUrlInput = ({ url }: FingerChartUrlInputProps) => {
  const form = useAppForm({
    validators: { onChange: FingerChartUrlFormSchema },
    defaultValues: { url },
  });

  const trpc = useTRPC();
  const update = useMutation(trpc.user.profile.upsertFingerChartUrl.mutationOptions());

  return (
    <div className="flex flex-col gap-2">
      <form.AppField name="url">
        {(field) => (
          <field.MutationInputFormField
            className="w-md"
            label="みんなの運指表URL"
            placeholder="http://unsi.nonip.net/user/[id] のURLを貼り付け"
            successMessage="URLを更新しました"
            onSuccess={(value) => form.reset({ url: value })}
            mutation={update}
          />
        )}
      </form.AppField>
      <UnsiLink />
    </div>
  );
};

const UnsiLink = () => {
  return (
    <Link
      href="http://unsi.nonip.net"
      target="_blank"
      className="flex w-fit items-center gap-1 text-muted-foreground text-xs opacity-70 transition-opacity hover:opacity-100"
    >
      運指表作成はこちら
      <ExternalLink className="h-3 w-3" />
    </Link>
  );
};
