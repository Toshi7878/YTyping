"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import type z from "zod";
import { CheckboxFormField } from "@/components/ui/checkbox/checkbox-form-field";
import { Form } from "@/components/ui/form";
import { SelectFormField } from "@/components/ui/select/select-form-field";
import type { RouterOutputs } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { CreateUserOptionSchema } from "@/validator/user-option";

interface OptionFormProps {
  userOptions: RouterOutputs["userOption"]["getUserOptions"];
}

export const OptionForm = ({ userOptions }: OptionFormProps) => {
  const form = useForm({
    resolver: zodResolver(CreateUserOptionSchema),
    defaultValues: {
      customUserActiveState: userOptions?.customUserActiveState ?? "ONLINE",
      hideUserStats: userOptions?.hideUserStats ?? false,
    },
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendUserOption = useMutation(
    trpc.userOption.updateOptions.mutationOptions({
      onSuccess: () => {
        void queryClient.invalidateQueries(trpc.userOption.getUserOptions.queryOptions());
      },
    }),
  );

  const onSubmit = (data: z.output<typeof CreateUserOptionSchema>) => {
    sendUserOption.mutate(data);
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-3">
        <SelectFormField
          label="オンライン状態"
          name="customUserActiveState"
          options={[
            { label: "プレイ中の曲を共有", value: "ONLINE" as const },
            { label: "プレイ中の曲を隠す", value: "ASK_ME" as const },
            { label: "オンライン状態を非表示", value: "HIDE_ONLINE" as const },
          ]}
          onValueChange={(value) => {
            onSubmit({
              customUserActiveState: value as z.output<typeof CreateUserOptionSchema>["customUserActiveState"],
              hideUserStats: form.getValues("hideUserStats"),
            });
          }}
        />
        <CheckboxFormField
          label="プロフィールページのタイピング統計情報を非公開にする"
          name="hideUserStats"
          onCheckedChange={(value: boolean) => {
            onSubmit({
              customUserActiveState: form.getValues("customUserActiveState"),
              hideUserStats: value,
            });
          }}
        />
      </form>
    </Form>
  );
};
