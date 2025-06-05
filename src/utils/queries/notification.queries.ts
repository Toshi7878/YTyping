import { useTRPC } from "@/trpc/trpc";

export const useNotificationQueries = () => {
  const trpc = useTRPC();
  return {
    hasNewNotification: () => trpc.notification.hasNewNotification.queryOptions(),
    infiniteNotifications: () =>
      trpc.notification.getInfiniteUserNotifications.infiniteQueryOptions(
        {
          limit: 20,
          direction: "forward" as const,
        },
        {
          getNextPageParam: (lastPage) => lastPage.nextCursor,
        },
      ),
  };
};
