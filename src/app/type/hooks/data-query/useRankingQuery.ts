import { useQuery } from "@tanstack/react-query";
import { RankingListType } from "../../ts/type";
import axios from "axios";
import { useParams } from "next/navigation";
import { QUERY_KEYS } from "@/config/consts";

export const useRankingQuery = () => {
  const { id: mapId } = useParams();

  const { data, error, isLoading } = useQuery<RankingListType[]>({
    queryKey: QUERY_KEYS.mapRanking(mapId),
    queryFn: async () => {
      const { data } = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ranking?id=${mapId}`,
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );

      return data;
    },

    enabled: !!mapId, // useQueryをidが存在する場合にのみ実行
    staleTime: Infinity, // データを常に新鮮に保つ
    refetchOnWindowFocus: false, // ウィンドウフォーカス時に再フェッチしない
    refetchOnReconnect: false, // 再接続時に再フェッチしない
    refetchOnMount: false, // マウント時に再フェッチしない
  });

  return { data, error, isLoading };
};
