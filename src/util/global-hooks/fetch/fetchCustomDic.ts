import { clientApi } from "@/trpc/client-api";

export const useFetchCustomDic = () => {
  const utils = clientApi.useUtils();

  return async () => {
    return await utils.morphConvert.getCustomDic.ensureData(undefined, {
      staleTime: Infinity,
      gcTime: Infinity,
    });
  };
};
