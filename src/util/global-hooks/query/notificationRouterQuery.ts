import { clientApi } from "@/trpc/client-api";

export const useNewNotificationCheckQuery = () => {
  return clientApi.notification.newNotificationCheck.useQuery();
};

export const useInfiniteNotificationsQuery = () => {
  return clientApi.notification.getInfiniteUserNotifications.useInfiniteQuery(
    {
      limit: 20,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );
};
