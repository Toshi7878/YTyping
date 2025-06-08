"use client";

import { MutationInputFormField } from "@/components/ui/input/input-form-field";
import { useTRPC } from "@/trpc/trpc";
import { myKeyboardFormSchema } from "@/validator/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";

interface MyKeyboardInputProps {
  myKeyboard: string;
}

export const MyKeyboardInput = ({ myKeyboard }: MyKeyboardInputProps) => {
  const form = useForm({
    mode: "onChange",
    resolver: zodResolver(myKeyboardFormSchema),
    defaultValues: {
      myKeyboard,
    },
  });

  const { reset } = form;

  const trpc = useTRPC();
  const updateMyKeyboard = useMutation(trpc.userProfileSetting.upsertMyKeyboard.mutationOptions());

  return (
    <FormProvider {...form}>
      <MutationInputFormField
        mutation={updateMyKeyboard}
        label="使用キーボード"
        successMessage="更新しました"
        name="myKeyboard"
        onSuccess={async (value: string) => {
          reset({ myKeyboard: value });
        }}
        className="w-md"
      />
    </FormProvider>
  );
};
