"use client";

import { CheckboxFormField } from "@/components/ui/checkbox/checkbox-form-field";
import { Form } from "@/components/ui/form";
import SelectFormField from "@/components/ui/select/select-form-field";
import { RouterOutPuts } from "@/server/api/trpc";
import { useTRPC } from "@/trpc/provider";
import { userOptionSchema } from "@/validator/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

type UserOptionFormValues = NonNullable<RouterOutPuts["userOption"]["getUserOptions"]>;

interface OptionSettingFormProps {
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

export const OptionSettingForm = ({ userOptions }: OptionSettingFormProps) => {
  const form = useForm({
    resolver: zodResolver(userOptionSchema),
    defaultValues: {
      custom_user_active_state: userOptions?.custom_user_active_state ?? "ONLINE",
      hide_user_stats: userOptions?.hide_user_stats ?? false,
    },
  });
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const sendUserOption = useMutation(
    trpc.userOption.update.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries(trpc.userOption.getUserOptions.queryOptions({}));
      },
    }),
  );

  const onSubmit = (data: UserOptionFormValues) => {
    sendUserOption.mutate(data);
  };

  return (
    <Form {...form}>
      <form className="flex flex-col gap-3">
        <SelectFormField
          label="オンライン状態"
          name="custom_user_active_state"
          options={[
            { label: "プレイ中の曲を共有", value: "ONLINE" as const },
            { label: "プレイ中の曲を隠す", value: "ASK_ME" as const },
            { label: "オンライン状態を非表示", value: "HIDE_ONLINE" as const },
          ]}
          onValueChange={(value) => {
            onSubmit({
              custom_user_active_state: value as UserOptionFormValues["custom_user_active_state"],
              hide_user_stats: form.getValues("hide_user_stats"),
            });
          }}
        />
        <CheckboxFormField
          label="プロフィールページのタイピング統計情報を非公開にする"
          name="hide_user_stats"
          onCheckedChange={(value: boolean) => {
            onSubmit({
              custom_user_active_state: form.getValues("custom_user_active_state"),
              hide_user_stats: value,
            });
          }}
        />
      </form>
    </Form>
  );
};
