"use client";

import AutoUpdateTextFormField from "@/components/share-components/form/AutoUpdateTextFormField";
import { useTRPC } from "@/trpc/trpc";
import { ThemeColors } from "@/types";
import { useDebounce } from "@/utils/global-hooks/useDebounce";
import { userFingerChartUrlSchema } from "@/validator/schema";
import { Link } from "@chakra-ui/next-js";
import { Flex, Stack, useTheme } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { FiExternalLink } from "react-icons/fi";

interface FingerChartUrlInputProps {
  url: string;
}

export const FingerChartUrlInput = ({ url }: FingerChartUrlInputProps) => {
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
  const trpc = useTRPC();
  const updateFingerChartUrl = useMutation(trpc.userProfileSetting.upsertFingerChartUrl.mutationOptions());

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
        <AutoUpdateTextFormField
          isPending={isPending}
          isSuccess={isSuccess}
          label="みんなの運指表URL"
          placeholder="http://unsi.nonip.net/user/[id] のURLを貼り付け"
          successMessage={urlValue ? "URLを更新しました" : "URLを削除しました"}
          name="url"
        />
        <Flex justifyContent="end" width={{ base: "full", md: "sm" }} flexDirection="row">
          <Link
            href="http://unsi.nonip.net"
            target="_blank"
            fontSize="xs"
            color={colors.text.body}
            opacity="0.7"
            display="flex"
            alignItems="center"
            gap="1"
          >
            運指表作成はこちら
            <FiExternalLink />
          </Link>
        </Flex>
      </Stack>
    </FormProvider>
  );
};
