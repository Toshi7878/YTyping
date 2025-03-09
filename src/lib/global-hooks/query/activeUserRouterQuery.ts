import { clientApi } from "@/trpc/client-api";
import { ActiveUserStatus } from "@/types/global-types";

export const useGetUserPlayingMapsQuery = (onlineUsers: ActiveUserStatus[]) => {
  return clientApi.activeUser.getUserPlayingMaps.useQuery(onlineUsers);
};
