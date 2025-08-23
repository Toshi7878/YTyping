import { useTRPC } from "@/trpc/trpc";

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
