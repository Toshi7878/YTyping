import { useTRPC } from "@/trpc/provider";

export const useResultQueries = () => {
  const trpc = useTRPC();

  return {
    result: ({ resultId }: { resultId: number | null }) => trpc.result.getTypingResultJson.queryOptions({ resultId }),
  };
};
