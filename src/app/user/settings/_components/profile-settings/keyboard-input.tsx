"use client";

import { useMutation } from "@tanstack/react-query";
import { orpc } from "@/orpc/provider";
import { useAppForm } from "@/ui/form-field-item";
import { keyboardFormSchema } from "@/validator/user/profile";

interface KeyboardInputProps {
  keyboard: string;
}

export const KeyboardInput = ({ keyboard }: KeyboardInputProps) => {
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
          label="使用キーボード"
          successMessage="更新しました"
          className="w-md"
        />
      )}
    </form.AppField>
  );
};
