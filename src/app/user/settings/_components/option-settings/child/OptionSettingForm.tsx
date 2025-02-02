import { useSetUserOptionsAtom } from "@/lib/global-atoms/globalAtoms";
import { useDebounce } from "@/lib/global-hooks/useDebounce";
import { RouterOutPuts } from "@/server/api/trpc";
import { clientApi } from "@/trpc/client-api";
import { userOptionSchema } from "@/validator/schema";
import { FormControl, FormLabel, Select } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { $Enums } from "@prisma/client";
import { useForm } from "react-hook-form";

interface FormData {
  custom_user_active_state: $Enums.custom_user_active_state;
}

interface OptionSettingFromProps {
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

export const OptionSettingForm = ({ userOptions }: OptionSettingFromProps) => {
  const debounce = useDebounce(500);
  const setUserOptions = useSetUserOptionsAtom();
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({
    resolver: zodResolver(userOptionSchema),
    defaultValues: {
      custom_user_active_state:
        userOptions?.custom_user_active_state ?? ("ONLINE" as $Enums.custom_user_active_state),
    },
  });
  const sendUserOption = clientApi.userOption.update.useMutation();

  const onSubmit = (data: FormData) => {
    setUserOptions(data);
    sendUserOption.mutate(data);
  };

  return (
    <FormControl as="form" gap={3} display="flex" flexDirection="column">
      <FormLabel
        mb={0}
        display="flex"
        alignItems="center"
        gap={2}
        htmlFor="custom_user_active_state"
      >
        オンライン状態
      </FormLabel>
      <Select
        width="fit-content"
        size="lg"
        {...register("custom_user_active_state", {
          setValueAs: (value) => {
            debounce(() => {
              handleSubmit(onSubmit)();
            });
            return value as $Enums.custom_user_active_state;
          },
        })}
      >
        <option value="ONLINE">プレイ中の曲を共有</option>
        <option value="ASK_ME">プレイ中の曲を隠す</option>
        <option value="HIDE_ONLINE">アクティブ状態を隠す</option>
      </Select>
    </FormControl>
  );
};
