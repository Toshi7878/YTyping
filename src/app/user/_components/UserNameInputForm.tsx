import { clientApi } from "@/trpc/client-api";
import { ThemeColors, ValidationUniqueState } from "@/types";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { useDebounce } from "@/util/global-hooks/useDebounce";
import { nameSchema } from "@/validator/schema";
import { Button, FormControl, FormLabel, Input, Spinner, Text, useTheme } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
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
  const debounce = useDebounce(1000);
  const theme: ThemeColors = useTheme();
  const router = useRouter();
  const toast = useCustomToast();

  const {
    register,
    formState: { errors, isDirty },
    handleSubmit,
    watch,
    reset,
  } = useForm({
    mode: "onChange",

    resolver: zodResolver(nameSchema),
    defaultValues: {
      newName: session?.user ? (session.user?.name as string) : "",
    },
  });

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

  useEffect(() => {
    if (!errors.newName && isDirty && newNameValue) {
      setNameState("pending");
      debounce(async () => {
        const result = await checkNewName.mutateAsync({
          newName: newNameValue,
        });
        if (result) {
          setNameState("duplicate");
        } else {
          setNameState("unique");
        }
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newNameValue]);

  return (
    <FormControl
      as="form"
      onSubmit={handleSubmit(onSubmit)}
      isInvalid={!!errors.newName}
      gap={2}
      display="flex"
      flexDirection="column"
    >
      <FormLabel display="flex" alignItems="center" gap={2} htmlFor="newName">
        {formLabel}
        {errors.newName ? (
          <Text as="span" color={theme.colors.error.light}>
            {errors.newName.message}
          </Text>
        ) : nameState === "pending" ? (
          <Spinner size="sm" />
        ) : (
          <Text
            as="span"
            visibility={isDirty && newNameValue ? "visible" : "hidden"}
            color={nameState === "duplicate" ? theme.colors.error.light : theme.colors.secondary.light}
          >
            {nameState === "duplicate"
              ? "この名前は既に使用されています。"
              : nameState === "unique" && "こちらの名前は使用可能です。"}
          </Text>
        )}
      </FormLabel>
      <Input size="md" autoFocus={isAutoFocus} {...register("newName")} placeholder={placeholder} required />
      <Button
        variant="upload"
        isLoading={updateName.isPending}
        type="submit"
        width="full"
        disabled={!!errors.newName?.message || nameState !== "unique" || !isDirty}
      >
        {buttonLabel}
      </Button>
    </FormControl>
  );
};
