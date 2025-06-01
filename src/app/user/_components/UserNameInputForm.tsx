"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/ui/input";
import { clientApi } from "@/trpc/client-api";
import { ValidationUniqueState } from "@/types";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { useDebounce } from "@/util/global-hooks/useDebounce";
import { nameSchema } from "@/validator/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  newName: string;
}

interface UserNameInputFormProps {
  placeholder?: string;
  formLabel?: string;
  buttonLabel?: string;
  isAutoFocus?: boolean;
  isHomeRedirect?: boolean;
}

export const UserNameInputForm = ({
  placeholder = "名前を入力",
  formLabel = "名前",
  buttonLabel = "名前を変更",
  isAutoFocus = false,
  isHomeRedirect = false,
}: UserNameInputFormProps) => {
  const { data: session, update } = useSession();
  const [nameState, setNameState] = useState<ValidationUniqueState>("unique");
  const [isCheckingName, setIsCheckingName] = useState(false);
  const debouncedValue = useDebounce(500); // デバウンス時間を短縮
  const router = useRouter();
  const toast = useCustomToast();

  const form = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(nameSchema),
    defaultValues: {
      newName: session?.user ? (session.user?.name as string) : "",
    },
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty, isValid },
  } = form;
  const newNameValue = watch("newName");

  const updateName = clientApi.userProfileSetting.updateName.useMutation();
  const checkNewName = clientApi.userProfileSetting.checkNewName.useMutation();

  const onSubmit = (data: FormData) => {
    updateName.mutate(data, {
      onSuccess: async (result) => {
        await update({ ...session?.user, name: data.newName });
        const { title, message } = result;
        toast({ type: "success", title, message });

        reset({ newName: data.newName });

        if (isHomeRedirect) {
          router.push("/");
        }
      },
      onError: (error) => {
        const title = "エラーが発生しました";
        const message = error.message;
        toast({ type: "error", title, message });
      },
    });
  };

  // ユニークチェック処理の改善
  useEffect(() => {
    const currentName = session?.user?.name;

    // バリデーションエラーがある場合や値が変更されていない場合はチェックしない
    if (errors.newName || !isDirty || !newNameValue || newNameValue === currentName) {
      setNameState("unique");
      setIsCheckingName(false);
      return;
    }

    setIsCheckingName(true);
    setNameState("pending");

    const checkUniqueness = async () => {
      try {
        const result = await checkNewName.mutateAsync({
          newName: newNameValue,
        });
        setNameState(result ? "duplicate" : "unique");
      } catch (error) {
        setNameState("unique"); // エラー時はユニークとして扱う
      } finally {
        setIsCheckingName(false);
      }
    };

    debouncedValue(checkUniqueness);
  }, [newNameValue, isDirty, errors.newName, session?.user?.name, checkNewName, debouncedValue]);

  // 状態に応じたメッセージとアイコンを取得
  const getValidationDisplay = () => {
    if (!isDirty || !newNameValue) return null;

    if (isCheckingName) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        message: "確認中...",
        variant: "default" as const,
      };
    }

    switch (nameState) {
      case "duplicate":
        return {
          icon: <XCircle className="h-4 w-4 text-destructive" />,
          message: "この名前は既に使用されています",
          variant: "error" as const,
        };
      case "unique":
        return {
          icon: <CheckCircle className="h-4 w-4 text-green-500" />,
          message: "この名前は使用可能です",
          variant: "success" as const,
        };
      default:
        return null;
    }
  };

  const validationDisplay = getValidationDisplay();
  const isSubmitDisabled = !isValid || nameState !== "unique" || !isDirty || isCheckingName || updateName.isPending;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="space-y-2">
          <InputFormField
            control={form.control}
            name="newName"
            label={
              <div className="flex items-center gap-2">
                <span>{formLabel}</span>
                {validationDisplay && (
                  <div className="flex items-center gap-1 text-sm">
                    {validationDisplay.icon}
                    <span
                      className={
                        validationDisplay.variant === "error"
                          ? "text-destructive"
                          : validationDisplay.variant === "success"
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      {validationDisplay.message}
                    </span>
                  </div>
                )}
              </div>
            }
            placeholder={placeholder}
            autoFocus={isAutoFocus}
            required
            variant={validationDisplay?.variant}
          />
        </div>

        <Button type="submit" disabled={isSubmitDisabled} className="w-full">
          {updateName.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              更新中...
            </>
          ) : (
            buttonLabel
          )}
        </Button>
      </form>
    </Form>
  );
};
