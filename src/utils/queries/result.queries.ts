import { useTRPC } from "@/trpc/trpc";

export const useResultQueries = () => {
  const trpc = useTRPC();

  return {
    result: ({ resultId }: { resultId: number | null }) => trpc.result.getUserResultData.queryOptions({ resultId }),
  };
};
