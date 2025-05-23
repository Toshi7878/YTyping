import { clientApi } from "@/trpc/client-api";

export const useMapQuery = ({ mapId }: { mapId: string }) => {
  const getMap = clientApi.map.getMap.useQuery(
    { mapId },
    {
      enabled: !!mapId,
      staleTime: Infinity,
      gcTime: Infinity,
    }
  );

  const { isPending, ...rest } = getMap;

  //isPendingをreturnしない。enabled:falseの場合、isPendingが常にtureになるのでisLoadingを使用する
  return rest;
};

export const useGetCreatedVideoIdMapListQuery = ({ videoId }: { videoId: string }) => {
  return clientApi.map.getCreatedVideoIdMapList.useQuery(
    {
      videoId,
    },
    {
      staleTime: Infinity,
    }
  );
};
