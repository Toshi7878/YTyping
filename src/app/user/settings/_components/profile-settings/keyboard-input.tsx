"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { orpc } from "@/orpc/provider";
import { useAppForm } from "@/ui/form-field-item";
import { keyboardFormSchema } from "@/validator/user/profile";

interface KeyboardInputProps {
  keyboard: string;
}

export const KeyboardInput = ({ keyboard }: KeyboardInputProps) => {
  const t = useTranslations("userSettings");
  const form = useAppForm({
    validators: { onChange: keyboardFormSchema },
    defaultValues: { keyboard },
  });
  const upsertKeyboard = useMutation(orpc.user.profile.upsertKeyboard.mutationOptions());

  return (
    <form.AppField name="keyboard">
      {(field) => (
        <field.MutationInputFormField
          mutation={upsertKeyboard}
          label={t("keyboardLabel")}
          successMessage={t("updated")}
          className="w-md"
        />
      )}
    </form.AppField>
  );
};
