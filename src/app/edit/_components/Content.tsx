"use client";
import { Box, Flex, Grid } from "@chakra-ui/react";
import { useEffect } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { useIsLrcConvertingState } from "../atoms/stateAtoms";
import { useTimerRegistration } from "../hooks/useTimer";
import EditTable from "./map-table/EditTable";
import EditorTabContent from "./tab/TabList";
import TimeRange from "./time-range/TimeRange";
import EditYouTube from "./youtube/EditYouTubePlayer";

function Content() {
  const isLrcConverting = useIsLrcConvertingState();

  const { addTimer, removeTimer } = useTimerRegistration();

  useEffect(() => {
    addTimer();
    return () => {
      removeTimer();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <Grid as="section" width="100%" my={1} gridTemplateColumns="1fr auto" gap-y="1px" alignItems="center">
          <TimeRange />
        </Grid>
        <Box as="section" width="100%">
          <EditTable />
        </Box>
      </Box>
    </LoadingOverlayWrapper>
  );
}

export default Content;
