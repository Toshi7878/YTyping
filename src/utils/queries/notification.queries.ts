import { useTRPC } from "@/trpc/provider";

export const useNotificationQueries = () => {
  const trpc = useTRPC();
  return {
    infinite: () =>
      trpc.notification.getInfinite.infiniteQueryOptions(
        {},
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          refetchOnWindowFocus: false,
          gcTime: Infinity,
        },
      ),
  };
};
