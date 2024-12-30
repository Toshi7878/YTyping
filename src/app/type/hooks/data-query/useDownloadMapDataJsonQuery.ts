import { QUERY_KEYS } from "@/config/global-consts";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { CreateMap } from "../../../../lib/instanceMapData";
import {
  useSetLineResultsAtom,
  useSetLineSelectIndexAtom,
  useSetMapAtom,
  useSetStatusAtoms,
} from "../../type-atoms/gameRenderAtoms";
import { useRefs } from "../../type-contexts/refsProvider";

export const useDownloadMapDataJsonQuery = () => {
  const { id: mapId } = useParams();
  const setLineResults = useSetLineResultsAtom();
  const setLineSelectIndex = useSetLineSelectIndexAtom();
  const setMap = useSetMapAtom();
  const { setStatusValues } = useSetStatusAtoms();
  const { totalProgressRef } = useRefs();

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
        setLineSelectIndex(map.typingLineNumbers[0]);
        totalProgressRef.current!.max = map.movieTotalTime;
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
