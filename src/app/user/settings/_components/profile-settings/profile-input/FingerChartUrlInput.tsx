"use client";

import { Form } from "@/components/ui/form";
import AutoUpdateTextFormField from "@/components/ui/input/auto-update-input-form-field";
import { useTRPC } from "@/trpc/trpc";
import { fingerChartUrlFormSchema } from "@/validator/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";

interface FingerChartUrlInputProps {
  url: string;
}

export const FingerChartUrlInput = ({ url }: FingerChartUrlInputProps) => {
  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(fingerChartUrlFormSchema),
    defaultValues: {
      url: url,
    },
  });

  const { reset } = form;

  const trpc = useTRPC();
  const update = useMutation(trpc.userProfileSetting.upsertFingerChartUrl.mutationOptions());

  return (
    <div className="flex flex-col gap-2">
      <Form {...form}>
        <AutoUpdateTextFormField
          className="w-md"
          label="みんなの運指表URL"
          placeholder="http://unsi.nonip.net/user/[id] のURLを貼り付け"
          successMessage="URLを更新しました"
          name="url"
          onSuccess={(value: string) => {
            reset({ url: value });
          }}
          mutation={update}
        />
      </Form>
      <UnsiLink />
    </div>
  );
};

const UnsiLink = () => {
  return (
    <Link
      href="http://unsi.nonip.net"
      target="_blank"
      className="text-muted-foreground flex w-fit items-center gap-1 text-xs opacity-70 transition-opacity hover:opacity-100"
    >
      運指表作成はこちら
      <ExternalLink className="h-3 w-3" />
    </Link>
  );
};
