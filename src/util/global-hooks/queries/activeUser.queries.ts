import { useTRPC } from "@/trpc/trpc";
import { ActiveUserStatus } from "@/types/global-types";

export const useActiveUserQueries = () => {
  const trpc = useTRPC();

  return {
    userPlayingMaps: (onlineUsers: ActiveUserStatus[]) => trpc.activeUser.getUserPlayingMaps.queryOptions(onlineUsers),
  };
};
