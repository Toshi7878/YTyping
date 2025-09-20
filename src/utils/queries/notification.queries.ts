import { useTRPC } from "@/trpc/provider";

export const useNotificationQueries = () => {
  const trpc = useTRPC();
  return {
    hasNewNotification: () => trpc.notification.hasNewNotification.queryOptions(),
    infiniteNotifications: () =>
      trpc.notification.getInfiniteUserNotifications.infiniteQueryOptions(
        {},
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
          refetchOnWindowFocus: false,
          gcTime: Infinity,
        },
      ),
  };
};
