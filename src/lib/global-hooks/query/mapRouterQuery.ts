import { clientApi } from "@/trpc/client-api";

export const useMapQuery = ({ mapId }: { mapId: string | undefined }) => {
  const getMap = clientApi.map.getMap.useQuery(
    { mapId: mapId as string },
    {
      enabled: !!mapId,
    }
  );

  const { isPending, ...rest } = getMap;

  //isPendingをreturnしない。enabled:falseの場合、isPendingが常にtureになるのでisLoadingを使用する
  return rest;
};
