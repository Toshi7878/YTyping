import { QUERY_KEYS } from "@/config/global-consts";
import { useSuccessToast } from "@/lib/global-hooks/useSuccessToast";
import { UploadResult } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSearchParams } from "next/navigation";
import {
  useSetEditMusicSourceAtom,
  useSetGeminiTagsAtom,
  useSetMapArtistNameAtom,
  useSetMapTitleAtom,
} from "../../edit-atom/editAtom";
import { GeminiMapInfo, GetYouTubeMovieInfo } from "../../ts/type";

export const useGetGeminiMapInfoQuery = (videoId: string) => {
  const successToast = useSuccessToast();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const isBackUp = searchParams.get("backup") === "true";

  const setMapTitle = useSetMapTitleAtom();
  const setMapArtistName = useSetMapArtistNameAtom();
  const setMusicSouce = useSetEditMusicSourceAtom();
  const setGeminiTags = useSetGeminiTagsAtom();

  const { data, error, isLoading } = useQuery<GeminiMapInfo | null>({
    queryKey: QUERY_KEYS.generateMapInfoGemini(videoId),
    queryFn: async () => {
      const ytInfo = await axios.post<GetYouTubeMovieInfo | UploadResult>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/get-youtube-channel-info`,
        { videoId },
      );

      if ("status" in ytInfo.data && ytInfo.data.status === 404) {
        successToast(ytInfo.data);
        return null;
        // 404エラーの処理をここに追加
      } else {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/generate-map-info-gemini`,
          { prompt_post: ytInfo.data },
        );

        const mapInfoData: GeminiMapInfo = JSON.parse(data.message);

        if (mapInfoData) {
          if (isNewCreate && !isBackUp) {
            setMapTitle(mapInfoData.musicTitle);
            setMapArtistName(mapInfoData.artistName);
            setMusicSouce(mapInfoData.musicSource);
          }

          setGeminiTags(mapInfoData.otherTags);
        }

        return mapInfoData;
      }
    },

    refetchOnWindowFocus: false, // ウィンドウフォーカス時に再フェッチしない
    refetchOnReconnect: false, // 再接続時に再フェッチしない
    refetchOnMount: false, // マウント時に再フェッチしない
  });

  return { isLoading, data };
};
