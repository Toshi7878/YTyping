"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";
import { CheckboxFormField } from "@/components/ui/checkbox/checkbox-form-field";
import { Form } from "@/components/ui/form";
import { SelectFormField } from "@/components/ui/select/select-form-field";
import type { RouterOutputs } from "@/server/api/trpc";
import { DEFAULT_USER_OPTIONS } from "@/server/drizzle/schema";
import { useTRPC } from "@/trpc/provider";
import { UpsertUserOptionSchema } from "@/validator/user-option";

interface OptionFormProps {
  userOptions: RouterOutputs["user"]["option"]["getForSession"];
}

export const OptionForm = ({ userOptions }: OptionFormProps) => {
  const form = useForm({
    resolver: zodResolver(UpsertUserOptionSchema),
    defaultValues: {
      presenceState: userOptions?.presenceState ?? DEFAULT_USER_OPTIONS.presenceState,
      hideUserStats: userOptions?.hideUserStats ?? DEFAULT_USER_OPTIONS.hideUserStats,
    },
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendUserOption = useMutation(
    trpc.user.option.upsert.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.user.option.getForSession.queryOptions());
      },
    }),
  );

  const onSubmit = (data: z.output<typeof UpsertUserOptionSchema>) => {
    sendUserOption.mutate(data);
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-3">
        <SelectFormField
          label="オンライン状態"
          name="presenceState"
          options={[
            { label: "プレイ中の曲を共有", value: "ONLINE" as const },
            { label: "プレイ中の曲を隠す", value: "ASK_ME" as const },
            { label: "オンライン状態を非表示", value: "HIDE_ONLINE" as const },
          ]}
          onValueChange={(value) => {
            onSubmit({
              presenceState: value as z.output<typeof UpsertUserOptionSchema>["presenceState"],
              hideUserStats: form.getValues("hideUserStats"),
            });
          }}
        />
        <CheckboxFormField
          label="プロフィールページのタイピング統計情報を非公開にする"
          name="hideUserStats"
          onCheckedChange={(value: boolean) => {
            onSubmit({
              presenceState: form.getValues("presenceState"),
              hideUserStats: value,
            });
          }}
        />
      </form>
    </Form>
  );
};
