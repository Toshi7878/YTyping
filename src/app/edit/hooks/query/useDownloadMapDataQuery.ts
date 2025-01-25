import { QUERY_KEYS } from "@/config/consts/globalConst";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export const useDownloadMapDataQuery = () => {
  const { id: mapId } = useParams();

  const { data, error, isLoading } = useQuery({
    queryKey: QUERY_KEYS.mapData(mapId),
    queryFn: async () => {
      try {
        const timestamp = new Date().getTime(); // 一意のクエリパラメータを生成

        const { data, error } = await supabase.storage
          .from("map-data") // バケット名を指定
          .download(`public/${mapId}.json?timestamp=${timestamp}`);

        if (error) {
          console.error("Error downloading from Supabase:", error);
          throw error;
        }

        const jsonString = await data.text();
        const jsonData = JSON.parse(jsonString);

        return jsonData;
      } catch (error) {
        console.error("Error processing the downloaded file:", error);
        throw error;
      }
    },
    enabled: !!mapId, // useQueryをidが存在する場合にのみ実行
    refetchOnWindowFocus: false, // ウィンドウフォーカス時に再フェッチしない
    refetchOnReconnect: false, // 再接続時に再フェッチしない
    refetchOnMount: false, // マウント時に再フェッチしない
  });

  return { data, isLoading };
};
