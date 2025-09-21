"use client";

import { MutationInputFormField } from "@/components/ui/input/input-form-field";
import { keyboardFormSchema } from "@/server/drizzle/validator/user-setting";
import { useTRPC } from "@/trpc/provider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";

interface KeyboardInputProps {
  keyboard: string;
}

export const KeyboardInput = ({ keyboard }: KeyboardInputProps) => {
  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(keyboardFormSchema),
    defaultValues: { keyboard },
  });

  const { reset } = form;

  const trpc = useTRPC();
  const updateKeyboard = useMutation(trpc.userProfile.upsertKeyboard.mutationOptions());

  return (
    <FormProvider {...form}>
      <MutationInputFormField
        mutation={updateKeyboard}
        label="使用キーボード"
        successMessage="更新しました"
        name="keyboard"
        onSuccess={async (value: string) => {
          reset({ keyboard: value });
        }}
        className="w-md"
      />
    </FormProvider>
  );
};
