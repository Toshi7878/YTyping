import { useTRPC } from "@/trpc/provider";

export const useUserStatsQueries = () => {
  const trpc = useTRPC();

  return {
    userActivity: ({ userId }: { userId: number }) =>
      trpc.userStats.getUserActivity.queryOptions(
        { userId },
        {
          staleTime: Infinity,
          gcTime: Infinity,
        },
      ),
  };
};
