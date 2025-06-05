"use client";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { InputFormField } from "@/components/ui/input";
import { useTRPC } from "@/trpc/trpc";
import { ValidationUniqueState } from "@/types";
import { useCustomToast } from "@/utils/global-hooks/useCustomToast";
import { useDebounce } from "@/utils/global-hooks/useDebounce";
import { nameSchema } from "@/validator/schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  newName: string;
}

interface UserNameInputFormProps {
  placeholder?: string;
}

export const UserNameInputForm = ({ placeholder = "名前を入力" }: UserNameInputFormProps) => {
  const { data: session, update } = useSession();
  const [validationState, setValidationState] = useState<ValidationUniqueState>("unique");
  const debounceTimer = useDebounce(1000);
  const router = useRouter();
  const showToast = useCustomToast();
  const pathname = usePathname();
  const trpc = useTRPC();

  const nameForm = useForm<FormData>({
    mode: "onChange",
    resolver: zodResolver(nameSchema),
    defaultValues: {
      newName: session?.user?.name || "",
    },
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = nameForm;

  const nameValue = watch("newName");
  const updateUserName = useMutation(
    trpc.userProfileSetting.updateName.mutationOptions({
      onSuccess: async (result) => {
        await update({ ...session?.user, name: result.id });
        reset({ newName: result.id });
        showToast({ type: "success", title: result.title });

        if (pathname === "/user/register") {
          router.push("/");
        }
      },
      onError: (error) => {
        const title = "エラーが発生しました";
        const message = error.message;
        showToast({ type: "error", title, message });
      },
    }),
  );

  const checkNameAvailability = useMutation(
    trpc.userProfileSetting.isNameAvailable.mutationOptions({
      onSuccess: (isAvailable) => {
        setValidationState(isAvailable ? "unique" : "duplicate");
      },
      onError: () => {
        setValidationState("error");
      },
    }),
  );

  const onSubmit = (formData: FormData) => {
    updateUserName.mutate(formData);
  };

  const checkNameWithDebounce = useCallback((name: string) => {
    debounceTimer(() => checkNameAvailability.mutate({ name }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!errors.newName && isDirty) {
      setValidationState("pending");
      checkNameWithDebounce(nameValue);
    }
  }, [isDirty, errors.newName, checkNameWithDebounce, nameValue]);

  return (
    <Form {...nameForm}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="space-y-2">
          <InputFormField
            control={nameForm.control}
            name="newName"
            label={
              <div className="flex items-center gap-2">
                <span>名前</span>
                <NameValidationDisplay
                  hasError={!!errors.newName?.message}
                  isDirty={isDirty}
                  newNameValue={nameValue}
                  nameState={validationState}
                />
              </div>
            }
            placeholder={placeholder}
            variant={validationState === "duplicate" ? "error" : validationState === "unique" ? "success" : "default"}
          />
        </div>

        <Button
          type="submit"
          loading={updateUserName.isPending}
          disabled={!!errors.newName?.message || validationState !== "unique" || !isDirty}
          className="w-full"
        >
          {updateUserName.isPending ? "更新中..." : "名前を決定"}
        </Button>
      </form>
    </Form>
  );
};

const NameValidationDisplay = ({
  hasError,
  isDirty,
  newNameValue,
  nameState,
}: {
  hasError: boolean;
  isDirty: boolean;
  newNameValue: string;
  nameState: ValidationUniqueState;
}) => {
  if (!isDirty || !newNameValue || hasError) return null;

  const getDisplayContent = () => {
    switch (nameState) {
      case "pending":
        return {
          icon: <Loader2 className="h-4 w-4 animate-spin" />,
          message: "確認中...",
          variant: "default" as const,
        };
      case "duplicate":
        return {
          icon: <XCircle className="text-destructive h-4 w-4" />,
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

  const displayContent = getDisplayContent();
  if (!displayContent) return null;

  return (
    <div className="flex items-center gap-1 text-sm">
      {displayContent.icon}
      <span
        className={
          displayContent.variant === "error"
            ? "text-destructive"
            : displayContent.variant === "success"
              ? "text-green-600"
              : "text-muted-foreground"
        }
      >
        {displayContent.message}
      </span>
    </div>
  );
};
