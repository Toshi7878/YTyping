"use client";

import AutoUpdateTextFormField from "@/components/share-components/form/AutoUpdateTextFormField";
import { useTRPC } from "@/trpc/trpc";
import { useDebounce } from "@/util/global-hooks/useDebounce";
import { userFingerChartUrlSchema } from "@/validator/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface MyKeyboardInputProps {
  myKeyboard: string;
}

export const MyKeyboardInput = ({ myKeyboard }: MyKeyboardInputProps) => {
  const debounce = useDebounce(1000);
  const [isPending, setIsPending] = useState(false);

  const methods = useForm({
    mode: "onChange",
    resolver: zodResolver(userFingerChartUrlSchema),
    defaultValues: {
      myKeyboard: myKeyboard,
    },
  });

  const {
    formState: { isDirty },
    reset,
    watch,
  } = methods;

  const myKeyboardValue = watch("myKeyboard");
  const trpc = useTRPC();
  const updateMyKeyboard = useMutation(trpc.userProfileSetting.upsertMyKeyboard.mutationOptions());

  useEffect(() => {
    if (isDirty) {
      setIsPending(true);
      debounce(async () => {
        await updateMyKeyboard.mutateAsync({
          myKeyboard: myKeyboardValue,
        });

        reset({ myKeyboard: myKeyboardValue });
        setIsPending(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myKeyboardValue]);

  const { isSuccess } = updateMyKeyboard;

  return (
    <FormProvider {...methods}>
      <AutoUpdateTextFormField
        isPending={isPending}
        isSuccess={isSuccess}
        label="使用キーボード"
        successMessage={myKeyboardValue ? "更新しました" : "使用キーボードを削除しました"}
        name="myKeyboard"
      />
    </FormProvider>
  );
};
