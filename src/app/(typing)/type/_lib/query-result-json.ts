import { getQueryClient, getTRPCOptionsProxy } from "@/trpc/provider";
import { initializeAllLineResult } from "./atoms/family";

export const queryResultJson = async (resultId: number) => {
  const queryClient = getQueryClient();
  const trpc = getTRPCOptionsProxy();
  const resultData = await queryClient.ensureQueryData(trpc.result.detail.getJson.queryOptions({ resultId }));
  initializeAllLineResult(resultData);
  return resultData;
};
