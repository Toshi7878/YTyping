import { QUERY_KEYS } from "@/config/consts";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { CreateMap } from "../../ts/scene-ts/ready/createTypingWord";
import {
  useSetLineResultsAtom,
  useSetMapAtom,
  useSetStatusAtoms,
} from "../../type-atoms/gameRenderAtoms";

export const useDownloadMapDataJsonQuery = () => {
  const { id: mapId } = useParams();
  const setLineResults = useSetLineResultsAtom();
  const setMap = useSetMapAtom();
  const { setStatusValues } = useSetStatusAtoms();

  const { data, error, isLoading } = useQuery({
    queryKey: QUERY_KEYS.mapData(mapId),
    queryFn: async () => {
      if (!mapId) return;
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

        const map = new CreateMap(jsonData);
        setMap(map);
        setLineResults(map.defaultLineResultData);
        setStatusValues({ line: map.lineLength });
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
  return { data, error, isLoading };
};
