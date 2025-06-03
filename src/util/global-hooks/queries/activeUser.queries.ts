import { clientApi } from "@/trpc/client-api";
import { ActiveUserStatus } from "@/types/global-types";

export const useActiveUserQueries = {
  getUserPlayingMaps: (onlineUsers: ActiveUserStatus[]) =>
    clientApi.activeUser.getUserPlayingMaps.useQuery(onlineUsers),
};
