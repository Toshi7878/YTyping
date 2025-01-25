"use client";
import { QUERY_KEYS } from "@/config/consts/globalConst";
import { db } from "@/lib/db";
import { IndexDBOption } from "@/types";
import { Box } from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useDispatch } from "react-redux";
import {
  useIsLrcConvertingAtom,
  useSetCanUploadAtom,
  useSetEditDirectEditCountAtom as useSetDirectEditCountAtom,
  useSetEditLineLyricsAtom,
  useSetEditLineSelectedCountAtom,
  useSetEditLineWordAtom,
  useSetEditTimeCountAtom,
  useSetIsEditYTPlayingAtom,
  useSetIsEditYTReadyAtom,
  useSetIsEditYTStartedAtom,
  useSetIsMapDataEditedAtom,
} from "../edit-atom/editAtom";
import { useDownloadMapDataQuery } from "../hooks/query/useDownloadMapDataQuery";
import { resetMapData, setMapData } from "../redux/mapDataSlice";
import { resetUndoRedoData } from "../redux/undoredoSlice";
import ColorStyle from "./ColorStyle";
import EditorTabContent from "./editor-tab-content/EditTabList";
import EditTable from "./editor-table-content/EditTable";
import TimeRange from "./editor-time-range-content/EditTimeRange";
import EditYouTube from "./editor-youtube-content/EditYoutube";

function Content() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const isBackUp = searchParams.get("backup") === "true";
  const isLrcConverting = useIsLrcConvertingAtom();
  const setIsYTStarted = useSetIsEditYTStartedAtom();
  const setIsYTReady = useSetIsEditYTReadyAtom();
  const setIsYTPlaying = useSetIsEditYTPlayingAtom();
  const setTimeCount = useSetEditTimeCountAtom();
  const setSelectedCount = useSetEditLineSelectedCountAtom();
  const setLyrics = useSetEditLineLyricsAtom();
  const setCanUpload = useSetCanUploadAtom();
  const setWord = useSetEditLineWordAtom();
  const setDirectEditCountAtom = useSetDirectEditCountAtom();
  const setIsMapDataEdited = useSetIsMapDataEditedAtom();
  const queryClient = useQueryClient();
  const { id: mapId } = useParams();

  const { data, isLoading } = useDownloadMapDataQuery();

  useEffect(() => {
    if (data) {
      dispatch(setMapData(data));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, isLoading]);

  useEffect(() => {
    setIsYTStarted(false);
    setIsYTReady(false);
    setIsYTPlaying(false);
    setSelectedCount(null);
    setTimeCount(0);
    setIsMapDataEdited(false);

    if (!mapId) {
      //新規作成譜面に移動したら初期化
      dispatch(resetUndoRedoData());
    }

    if (isBackUp) {
      db.editorNewCreateBak
        .get({ optionName: "backupMapData" })
        .then((data: IndexDBOption | undefined) => {
          if (data) {
            dispatch(setMapData(data.value));
          }
        });
      setCanUpload(true);
    } else {
      dispatch(resetMapData());
      setCanUpload(false);
    }

    return () => {
      setLyrics("");
      setWord("");
      setDirectEditCountAtom(null);
      if (mapId) {
        queryClient.removeQueries({ queryKey: QUERY_KEYS.mapData(mapId) });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, newVideoId]);

  useEffect(() => {
    window.getSelection()!.removeAllRanges();
  }, []);

  return (
    <LoadingOverlayWrapper active={isLrcConverting} spinner={true} text="Loading...">
      <Box
        as="main"
        display="flex"
        minHeight="100vh"
        paddingX={{ base: 0, md: 14 }}
        flexDirection="column"
        alignItems="center"
        paddingTop="55px"
        width="100vw"
      >
        <Box as="section" display="flex" flexDirection={{ base: "column", lg: "row" }} width="100%">
          <EditYouTube className="mt-1 md:mr-5 md:min-w-[416px] md:min-h-[234px] md:max-h-[234px]" />
          <EditorTabContent />
        </Box>
        <Box as="section" width="100%" my={1}>
          <TimeRange />
        </Box>
        <Box as="section" width="100%" mt={0}>
          <EditTable mapLoading={isLoading} />
        </Box>
      </Box>
      <ColorStyle />
    </LoadingOverlayWrapper>
  );
}

export default Content;
