import CheckBoxFormField from "@/components/share-components/form/CheckBoxFormField";
import SelectFormField from "@/components/share-components/form/SelectFormField";
import { useSetUserOptions, useUserOptionsState } from "@/lib/global-atoms/globalAtoms";
import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { userOptionSchema } from "@/validator/schema";
import { Flex } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, FormProvider, SubmitHandler, useForm } from "react-hook-form";

// ユーザーオプションの型を定義
type UserOptionFormValues = NonNullable<RouterOutPuts["userOption"]["getUserOptions"]>;

export const OptionSettingForm = () => {
  const userOptions = useUserOptionsState();
  const setUserOptions = useSetUserOptions();
  const methods = useForm<UserOptionFormValues>({
    resolver: zodResolver(userOptionSchema),
    defaultValues: {
      custom_user_active_state: userOptions.custom_user_active_state,
      hide_user_stats: userOptions.hide_user_stats,
    },
  });
  const sendUserOption = clientApi.userOption.update.useMutation();
  const onSubmit = (data: UserOptionFormValues) => {
    setUserOptions(data);
    sendUserOption.mutate(data);
  };

  return (
    <FormProvider {...methods}>
      <Flex flexDirection="column" gap={3}>
        <SelectFormField
          label="オンライン状態"
          name="custom_user_active_state"
          options={[
            { label: "プレイ中の曲を共有", value: "ONLINE" as const },
            { label: "プレイ中の曲を隠す", value: "ASK_ME" as const },
            { label: "オンライン状態を非表示", value: "HIDE_ONLINE" as const },
          ]}
          onSubmit={onSubmit as SubmitHandler<FieldValues>}
        />
        <CheckBoxFormField
          label="プロフィールページのタイピング統計情報を非公開にする"
          name="hide_user_stats"
          onSubmit={onSubmit as SubmitHandler<FieldValues>}
        />
      </Flex>
    </FormProvider>
  );
};
