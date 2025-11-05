import { queryOptions } from "@tanstack/react-query";
import { fetchBackupMap } from "@/lib/indexed-db";
import { useTRPC } from "@/trpc/provider";

export const useMapQueries = () => {
  const trpc = useTRPC();

  return {
    mapInfo: ({ mapId }: { mapId: number }) =>
      trpc.map.getMapInfo.queryOptions(
        { mapId },
        {
          enabled: !!mapId,
          staleTime: Infinity,
          gcTime: Infinity,
        },
      ),

    editBackupMap: () =>
      queryOptions({
        queryKey: ["backup"],
        queryFn: fetchBackupMap,
      }),
  };
};
