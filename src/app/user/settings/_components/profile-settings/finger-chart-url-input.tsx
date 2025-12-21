"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { MutationInputFormField } from "@/components/ui/input/input-form-field";
import { useTRPC } from "@/trpc/provider";
import { FingerChartUrlFormSchema } from "@/validator/user-setting";

interface FingerChartUrlInputProps {
  url: string;
}

export const FingerChartUrlInput = ({ url }: FingerChartUrlInputProps) => {
  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(FingerChartUrlFormSchema),
    defaultValues: { url },
  });

  const { reset } = form;

  const trpc = useTRPC();
  const update = useMutation(trpc.userProfile.upsertFingerChartUrl.mutationOptions());

  return (
    <div className="flex flex-col gap-2">
      <Form {...form}>
        <MutationInputFormField
          className="w-md"
          label="みんなの運指表URL"
          placeholder="http://unsi.nonip.net/user/[id] のURLを貼り付け"
          successMessage="URLを更新しました"
          name="url"
          onSuccess={(value) => reset({ url: value })}
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
      className="flex w-fit items-center gap-1 text-muted-foreground text-xs opacity-70 transition-opacity hover:opacity-100"
    >
      運指表作成はこちら
      <ExternalLink className="h-3 w-3" />
    </Link>
  );
};
