import { QUERY_KEYS } from "@/config/global-consts";
import { supabase } from "@/lib/supabaseClient";
import { useQuery } from "@tanstack/react-query";
import {
  useSceneAtom,
  useSetIsLoadingOverlayAtom,
  useSetLineResultsAtom,
} from "../../type-atoms/gameRenderAtoms";
import { useRefs } from "../../type-contexts/refsProvider";
import { useProceedRetry } from "../playing-hooks/useRetry";

export const useDownloadPlayDataJsonQuery = (resultId: number | null) => {
  const setLineResults = useSetLineResultsAtom();
  const scene = useSceneAtom();

  const setIsLoadingOverlay = useSetIsLoadingOverlayAtom();
  const { playerRef } = useRefs();
  const proceedRetry = useProceedRetry();

  const { data, error, isLoading } = useQuery({
    queryKey: QUERY_KEYS.userPlayData(String(resultId)),
    queryFn: async () => {
      setIsLoadingOverlay(true);
      try {
        const timestamp = new Date().getTime(); // 一意のクエリパラメータを生成

        const { data, error } = await supabase.storage
          .from("user-result") // バケット名を指定
          .download(`public/${resultId}.json?timestamp=${timestamp}`);

        if (error) {
          console.error("Error downloading from Supabase:", error);
          throw error;
        }

        const jsonString = await data.text();
        const jsonData = JSON.parse(jsonString);
        setLineResults(jsonData);

        if (scene === "end") {
          proceedRetry("replay");
        } else {
          playerRef.current.playVideo();
        }
        return jsonData;
      } catch (error) {
        console.error("Error processing the downloaded file:", error);
        throw error;
      } finally {
        setIsLoadingOverlay(false);
      }
    },
    enabled: !!resultId, // useQueryをidが存在する場合にのみ実行
    refetchOnWindowFocus: false, // ウィンドウフォーカス時に再フェッチしない
    refetchOnReconnect: false, // 再接続時に再フェッチしない
    refetchOnMount: false, // マウント時に再フェッチしない
  });

  return { data, error, isLoading };
};
