import { clientApi } from "@/trpc/client-api";

export const useNotificationQueries = {
  hasNewNotification: () => clientApi.notification.newNotificationCheck.useQuery(),
  getInfiniteNotifications: () =>
    clientApi.notification.getInfiniteUserNotifications.useInfiniteQuery(
      {
        limit: 20,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      },
    ),
};
