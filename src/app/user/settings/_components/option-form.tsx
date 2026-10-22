"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import type { RouterOutputs } from "@/server/api/root";
import { DEFAULT_USER_OPTIONS, type PRESENCE_STATE_TYPES } from "@/server/drizzle/schema";
import { setUserOptions } from "@/store/user-options";
import { useAppForm } from "@/ui/form-field-item";

interface UserOptionsFormProps {
  userOptions: RouterOutputs["user"]["option"]["getForSession"];
}

export const UserOptionsForm = ({ userOptions }: UserOptionsFormProps) => {
  const t = useTranslations("userSettings");
  const form = useAppForm({
    defaultValues: {
      presenceState: userOptions?.presenceState ?? DEFAULT_USER_OPTIONS.presenceState,
      hideUserStats: userOptions?.hideUserStats ?? DEFAULT_USER_OPTIONS.hideUserStats,
    },
  });

  const upsertUserOption = useMutation(
    orpc.user.option.upsert.mutationOptions({
      onSuccess: (data) => setUserOptions(data),
    }),
  );

  return (
    <form className="flex flex-col gap-3">
      <form.AppField name="presenceState">
        {(field) => (
          <field.SelectFormField
            label={t("presence")}
            options={
              [
                { label: t("presenceOnline"), value: "ONLINE" as const },
                { label: t("presenceAskMe"), value: "ASK_ME" as const },
                { label: t("presenceHide"), value: "HIDE_ONLINE" as const },
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
            label={t("hideStats")}
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
