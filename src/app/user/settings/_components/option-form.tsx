"use client";

import { useMutation } from "@tanstack/react-query";
import type { RouterOutputs } from "@/server/api/trpc";
import { DEFAULT_USER_OPTIONS, type PRESENCE_STATE_TYPES } from "@/server/drizzle/schema";
import { setUserOptions } from "@/store/user-options";
import { useTRPC } from "@/trpc/provider";
import { useAppForm } from "@/ui/form-field-item";

interface UserOptionsFormProps {
  userOptions: RouterOutputs["user"]["option"]["getForSession"];
}

export const UserOptionsForm = ({ userOptions }: UserOptionsFormProps) => {
  const form = useAppForm({
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
    <form className="flex flex-col gap-3">
      <form.AppField name="presenceState">
        {(field) => (
          <field.SelectFormField
            label="オンライン状態"
            options={
              [
                { label: "プレイ中の曲を共有", value: "ONLINE" as const },
                { label: "プレイ中の曲を隠す", value: "ASK_ME" as const },
                { label: "オンライン状態を非表示", value: "HIDE_ONLINE" as const },
              ] satisfies { label: string; value: (typeof PRESENCE_STATE_TYPES)[number] }[]
            }
            onValueChange={(value: (typeof PRESENCE_STATE_TYPES)[number]) => {
              setUserOptions((prev) => ({ ...prev, presenceState: value }));
              upsertUserOption.mutate({ presenceState: value });
            }}
          />
        )}
      </form.AppField>
      <form.AppField name="hideUserStats">
        {(field) => (
          <field.CheckboxFormField
            label="プロフィールページのタイピング統計情報を非公開にする"
            onCheckedChange={(value: boolean) => {
              setUserOptions((prev) => ({ ...prev, hideUserStats: value }));
              upsertUserOption.mutate({ hideUserStats: value });
            }}
          />
        )}
      </form.AppField>
    </form>
  );
};
