import { clientApi } from "@/trpc/client-api";

export const useMapQueries = {
  getMap: ({ mapId }: { mapId: string }) =>
    clientApi.map.getMap.useQuery(
      { mapId },
      {
        enabled: !!mapId,
        staleTime: Infinity,
        gcTime: Infinity,
      },
    ),
  getCreatedMapsByVideoId: ({ videoId }: { videoId: string }) =>
    clientApi.map.getCreatedMapsByVideoId.useQuery({ videoId }, { staleTime: Infinity }),
};
