import { useTRPC } from "@/trpc/trpc";

export const useMapQueries = () => {
  const trpc = useTRPC();

  return {
    map: ({ mapId }: { mapId: string }) =>
      trpc.map.getMap.queryOptions(
        { mapId },
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
  };
};
