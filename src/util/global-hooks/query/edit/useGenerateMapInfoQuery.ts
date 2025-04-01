import {
  useSetGeminiTagsState,
  useSetMapArtistState,
  useSetMapSourceState,
  useSetMapTitleState,
} from "@/app/edit/atoms/stateAtoms";
import { clientApi } from "@/trpc/client-api";
import { useCustomToast } from "@/util/global-hooks/useCustomToast";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const useGenerateMapInfoQuery = (videoId: string) => {
  const toast = useCustomToast();
  const searchParams = useSearchParams();
  const isNewCreate = !!searchParams.get("new");
  const isBackUp = searchParams.get("backup") === "true";

  const setMapTitle = useSetMapTitleState();
  const setMapArtistName = useSetMapArtistState();
  const setMusicSouce = useSetMapSourceState();
  const setGeminiTags = useSetGeminiTagsState();
  const generateMapInfo = clientApi.gemini.generateMapInfo.useQuery(
    { videoId: videoId },
    {
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
      if (isNewCreate && !isBackUp) {
        setMapTitle(mapInfoData.musicTitle);
        setMapArtistName(mapInfoData.artistName);
        setMusicSouce(mapInfoData.musicSource);
      }
      setGeminiTags(mapInfoData.otherTags);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInfoData]);

  return generateMapInfo;
};
