"use client";

import { clientApi } from "@/trpc/client-api";
import { ThemeColors } from "@/types";
import { useDebounce } from "@/util/global-hooks/useDebounce";
import { userFingerChartUrlSchema } from "@/validator/schema";
import { FormControl, FormLabel, Input, Spinner, Text, useTheme } from "@chakra-ui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

interface UpdateFingerChartUrlProps {
  url: string;
}

export const UpdateFingerChartUrl = ({ url }: UpdateFingerChartUrlProps) => {
  const debounce = useDebounce(1000);

  const theme: ThemeColors = useTheme();

  const {
    register,
    formState: { errors, isDirty },
    watch,
  } = useForm({
    mode: "onChange",
    resolver: zodResolver(userFingerChartUrlSchema),
    defaultValues: {
      url,
    },
  });

  const urlValue = watch("url");
  const updateFingerChartUrl = clientApi.userProfileSetting.updateFingerChartUrl.useMutation();

  useEffect(() => {
    if (isDirty) {
      debounce(async () => {
        await updateFingerChartUrl.mutateAsync({
          url: urlValue,
        });
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlValue]);

  return (
    <FormControl as="form" display="flex" flexDirection="column">
      <FormLabel display="flex" alignItems="center" gap={2} htmlFor="fingerChartUrl">
        みんなの運指表URL
        {errors.url ? (
          <Text as="span" color={theme.colors.error.light}>
            {errors.url.message}
          </Text>
        ) : updateFingerChartUrl.isPending ? (
          <Spinner size="sm" />
        ) : (
          <Text as="span" visibility={isDirty && urlValue ? "visible" : "hidden"} color={theme.colors.secondary.light}>
            URLを更新しました
          </Text>
        )}
      </FormLabel>
      <Input
        size="sm"
        autoComplete="off"
        {...register("url")}
        placeholder="http://unsi.nonip.net/user/[id] のURLを貼り付け"
      />
    </FormControl>
  );
};
