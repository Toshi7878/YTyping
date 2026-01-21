"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { CheckboxFormField } from "@/components/ui/checkbox/checkbox-form-field";
import { Form } from "@/components/ui/form";
import { SelectFormField } from "@/components/ui/select/select-form-field";
import { setUserOptions } from "@/lib/atoms/global-atoms";
import type { RouterOutputs } from "@/server/api/trpc";
import { DEFAULT_USER_OPTIONS, type PRESENCE_STATES } from "@/server/drizzle/schema";
import { useTRPC } from "@/trpc/provider";

interface UserOptionsFormProps {
  userOptions: RouterOutputs["user"]["option"]["getForSession"];
}

export const UserOptionsForm = ({ userOptions }: UserOptionsFormProps) => {
  const form = useForm({
    defaultValues: {
      presenceState: userOptions?.presenceState ?? DEFAULT_USER_OPTIONS.presenceState,
      hideUserStats: userOptions?.hideUserStats ?? DEFAULT_USER_OPTIONS.hideUserStats,
    },
  });
  const trpc = useTRPC();

  const upsertUserOption = useMutation(
    trpc.user.option.upsert.mutationOptions({
      onSuccess: (data) => setUserOptions(data),
    }),
  );

  return (
    <Form {...form}>
      <form className="flex flex-col gap-3">
        <SelectFormField
          label="オンライン状態"
          name="presenceState"
          options={
            [
              { label: "プレイ中の曲を共有", value: "ONLINE" as const },
              { label: "プレイ中の曲を隠す", value: "ASK_ME" as const },
              { label: "オンライン状態を非表示", value: "HIDE_ONLINE" as const },
            ] satisfies { label: string; value: (typeof PRESENCE_STATES)[number] }[]
          }
          onValueChange={(value: (typeof PRESENCE_STATES)[number]) => {
            setUserOptions((prev) => ({ ...prev, presenceState: value }));
            upsertUserOption.mutate({ presenceState: value });
          }}
        />
        <CheckboxFormField
          label="プロフィールページのタイピング統計情報を非公開にする"
          name="hideUserStats"
          onCheckedChange={(value: boolean) => {
            setUserOptions((prev) => ({ ...prev, hideUserStats: value }));
            upsertUserOption.mutate({ hideUserStats: value });
          }}
        />
      </form>
    </Form>
  );
};
