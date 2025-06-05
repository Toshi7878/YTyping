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
    createdMapsByVideoId: ({ videoId }: { videoId: string }) =>
      trpc.map.getCreatedMapsByVideoId.queryOptions({ videoId }),
  };
};
