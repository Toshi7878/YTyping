"use client";
import { db } from "@/lib/db";
import { clientApi } from "@/trpc/client-api";
import { IndexDBOption } from "@/types";
import { Box, Flex, Grid } from "@chakra-ui/react";
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
import { resetMapData, setMapData } from "../redux/mapDataSlice";
import { resetUndoRedoData } from "../redux/undoredoSlice";
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
  const { id: mapId } = useParams();
  const { data: mapData, isLoading } = clientApi.map.getMap.useQuery(
    { mapId: mapId as string },
    {
      enabled: !newVideoId,
      gcTime: 0,
    }
  );

  useEffect(() => {
    if (mapData) {
      dispatch(setMapData(mapData));
    } else {
      dispatch(resetMapData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    setIsYTStarted(false);
    setIsYTReady(false);
    setIsYTPlaying(false);
    setSelectedCount(null);
    setTimeCount(0);
    setIsMapDataEdited(false);
    dispatch(resetUndoRedoData());

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
      setCanUpload(false);
    }

    return () => {
      setLyrics("");
      setWord("");
      setDirectEditCountAtom(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, newVideoId]);

  useEffect(() => {
    window.getSelection()!.removeAllRanges();
  }, []);

  return (
    <LoadingOverlayWrapper
      active={isLrcConverting}
      spinner={true}
      text="Loading..."
      className="w-full xl:w-[90%] 2xl:w-[80%]"
    >
      <Box marginX={{ base: 0, md: "auto" }} pt={{ base: 4, lg: 0 }}>
        <Flex
          as="section"
          flexDirection={{ base: "column", lg: "row" }}
          width="100%"
          gap={{ base: 2, lg: 6 }}
        >
          <EditYouTube className="w-full lg:w-[416px] h-[286px] aspect-video select-none" />
          <EditorTabContent />
        </Flex>
        <Grid
          as="section"
          width="100%"
          my={1}
          gridTemplateColumns="1fr auto"
          gap-y="1px"
          alignItems="center"
        >
          <TimeRange />
        </Grid>
        <Box as="section" width="100%">
          <EditTable mapLoading={isLoading} />
        </Box>
      </Box>
    </LoadingOverlayWrapper>
  );
}

export default Content;
