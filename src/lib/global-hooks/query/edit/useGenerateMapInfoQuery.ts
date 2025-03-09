import {
  useSetEditMusicSourceAtom,
  useSetGeminiTagsAtom,
  useSetMapArtistNameAtom,
  useSetMapTitleAtom,
} from "@/app/edit/edit-atom/editAtom";
import { useCustomToast } from "@/lib/global-hooks/useCustomToast";
import { clientApi } from "@/trpc/client-api";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useGenerateMapInfoQuery = (videoId: string) => {
  const toast = useCustomToast();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const isBackUp = searchParams.get("backup") === "true";

  const setMapTitle = useSetMapTitleAtom();
  const setMapArtistName = useSetMapArtistNameAtom();
  const setMusicSouce = useSetEditMusicSourceAtom();
  const setGeminiTags = useSetGeminiTagsAtom();
  const generateMapInfo = clientApi.gemini.generateMapInfo.useQuery(
    { videoId: videoId },
    {
      enabled: isNewCreate && !isBackUp,
      staleTime: Infinity,
      gcTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
    }
  );

  const { data: mapInfoData, error } = generateMapInfo;

  useEffect(() => {
    if (error) {
      toast({ type: "error", title: error.message });
    }
  }, [error, toast]);

  useEffect(() => {
    if (mapInfoData) {
      setMapTitle(mapInfoData.musicTitle);
      setMapArtistName(mapInfoData.artistName);
      setMusicSouce(mapInfoData.musicSource);
      setGeminiTags(mapInfoData.otherTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInfoData]);

  return generateMapInfo;
};
