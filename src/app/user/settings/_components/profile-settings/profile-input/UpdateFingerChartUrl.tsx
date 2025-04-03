"use client";

import AutoUpdateFormField from "@/components/share-components/form/AutoUpdateFormField";
import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { useDebounce } from "@/util/global-hooks/useDebounce";
import { userFingerChartUrlSchema } from "@/validator/schema";
import { Link } from "@chakra-ui/next-js";
import { Flex, Stack, useTheme } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

interface UpdateFingerChartUrlProps {
  url: string;
}

export const UpdateFingerChartUrl = ({ url }: UpdateFingerChartUrlProps) => {
  const debounce = useDebounce(1000);
  const [isPending, setIsPending] = useState(false);

  const methods = useForm({
    mode: "onChange",
    resolver: zodResolver(userFingerChartUrlSchema),
    defaultValues: {
      url,
    },
  });

  const {
    formState: { isDirty },
    reset,
    watch,
  } = methods;

  const urlValue = watch("url");
  const updateFingerChartUrl = clientApi.userProfileSetting.updateFingerChartUrl.useMutation();

  useEffect(() => {
    if (isDirty) {
      setIsPending(true);
      debounce(async () => {
        await updateFingerChartUrl.mutateAsync({
          url: urlValue,
        });

        reset({ url: urlValue });
        setIsPending(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlValue]);

  const { isSuccess } = updateFingerChartUrl;
  const { colors }: ThemeColors = useTheme();

  return (
    <FormProvider {...methods}>
      <Stack>
        <AutoUpdateFormField
          isPending={isPending}
          isSuccess={isSuccess}
          label="みんなの運指表URL"
          placeholder="http://unsi.nonip.net/user/[id] のURLを貼り付け"
          successMessage={urlValue ? "URLを更新しました" : "URLを削除しました"}
          name="url"
        />
        <Flex justifyContent="end">
          <Link href="http://unsi.nonip.net" target="_blank" fontSize="xs" color={colors.text.body} opacity="0.7">
            運指表作成はこちら
          </Link>
        </Flex>
      </Stack>
    </FormProvider>
  );
};
