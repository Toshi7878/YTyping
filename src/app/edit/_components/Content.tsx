"use client";
import { db } from "@/lib/db";
import { useMapQuery } from "@/lib/global-hooks/query/mapRouterQuery";
import { IndexDBOption } from "@/types";
import { Box, Flex, Grid } from "@chakra-ui/react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useDispatch } from "react-redux";
import { usePathChangeAtomReset } from "../atoms/reset";
import { useIsLrcConvertingState, useSetCanUploadState } from "../atoms/stateAtoms";
import { resetMapData, setMapData } from "../redux/mapDataSlice";
import EditorTabContent from "./editor-tab-content/EditTabList";
import EditTable from "./editor-table-content/EditTable";
import TimeRange from "./editor-time-range-content/EditTimeRange";
import EditYouTube from "./editor-youtube-content/EditYoutube";

function Content() {
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const newVideoId = searchParams.get("new") || "";
  const isBackUp = searchParams.get("backup") === "true";
  const isLrcConverting = useIsLrcConvertingState();
  const setCanUpload = useSetCanUploadState();
  const pathChangeReset = usePathChangeAtomReset();
  const { id: mapId } = useParams();
  const { data: mapData, isLoading } = useMapQuery({ mapId: mapId as string });

  useEffect(() => {
    if (mapData) {
      dispatch(setMapData(mapData));
    } else {
      dispatch(resetMapData());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapData]);

  useEffect(() => {
    if (isBackUp) {
      db.editorNewCreateBak.get({ optionName: "backupMapData" }).then((data: IndexDBOption | undefined) => {
        if (data) {
          dispatch(setMapData(data.value));
        }
      });
      setCanUpload(true);
    } else {
      setCanUpload(false);
    }

    return () => {
      pathChangeReset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId, newVideoId]);

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
        <Grid as="section" width="100%" my={1} gridTemplateColumns="1fr auto" gap-y="1px" alignItems="center">
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
