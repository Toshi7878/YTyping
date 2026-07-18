"use client";

import { useMutation } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/provider";
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

  const trpc = useTRPC();
  const upsertKeyboard = useMutation(trpc.user.profile.upsertKeyboard.mutationOptions());

  return (
    <form.AppField name="keyboard">
      {(field) => (
        <field.MutationInputFormField
          mutation={upsertKeyboard}
          label="使用キーボード"
          successMessage="更新しました"
          onSuccess={(value) => form.reset({ keyboard: value })}
          className="w-md"
        />
      )}
    </form.AppField>
  );
};
