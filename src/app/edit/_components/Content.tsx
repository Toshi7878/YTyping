"use client";
import { Box, Flex, Grid, useToast } from "@chakra-ui/react";
import { useEffect } from "react";
import LoadingOverlayWrapper from "react-loading-overlay-ts";
import { usePathChangeAtomReset } from "../atoms/reset";
import { useCanUploadState, useIsLrcConvertingState } from "../atoms/stateAtoms";
import { useTimerRegistration } from "../hooks/useTimer";
import useHasMapUploadPermission from "../hooks/useUserEditPermission";
import EditTable from "./map-table/EditTable";
import { NOT_EDIT_PERMISSION_TOAST_ID } from "./tab/tab-panels/TabInfoUpload";
import EditorTabContent from "./tab/TabList";
import TimeRange from "./time-range/TimeRange";
import EditYouTube from "./youtube/EditYouTubePlayer";

function Content() {
  const isLrcConverting = useIsLrcConvertingState();

  const { addTimer, removeTimer } = useTimerRegistration();
  const pathChangeReset = usePathChangeAtomReset();
  const chakraToast = useToast();
  const canUpload = useCanUploadState();
  const hasUploadPermission = useHasMapUploadPermission();

  useEffect(() => {
    addTimer();
    return () => {
      removeTimer();
      pathChangeReset();
      chakraToast.close(NOT_EDIT_PERMISSION_TOAST_ID);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (canUpload) {
        event.preventDefault();
        return "このページを離れると、行った変更が保存されない可能性があります。";
      }
    };

    if (hasUploadPermission) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [canUpload, hasUploadPermission]);

  return (
    <LoadingOverlayWrapper
      active={isLrcConverting}
      spinner={true}
      text="Loading..."
      className="w-full xl:w-[90%] 2xl:w-[80%]"
    >
      <Box marginX={{ base: 0, md: "auto" }} pt={{ base: 4, lg: 0 }}>
        <Flex as="section" flexDirection={{ base: "column", lg: "row" }} width="100%" gap={{ base: 2, lg: 6 }}>
          <EditYouTube className="aspect-video h-[286px] w-full select-none lg:w-[416px]" />
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
