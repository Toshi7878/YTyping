import { fetchBackupMap } from "@/lib/indexed-db";
import { useTRPC } from "@/trpc/provider";
import { queryOptions } from "@tanstack/react-query";

export const useMapQueries = () => {
  const trpc = useTRPC();

  return {
    map: ({ mapId }: { mapId: string }) =>
      trpc.map.getMapJson.queryOptions(
        { mapId: Number(mapId) },
        {
          enabled: !!mapId,
          staleTime: Infinity,
          gcTime: Infinity,
        },
      ),
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
