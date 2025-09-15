import { useTRPC } from "@/trpc/provider";
import type { ActiveUserStatus } from "@/types/global-types";

export const useActiveUserQueries = () => {
  const trpc = useTRPC();

  return {
    userPlayingMaps: (onlineUsers: ActiveUserStatus[]) => trpc.mapList.getUserPlayingMaps.queryOptions(onlineUsers),
  };
};
