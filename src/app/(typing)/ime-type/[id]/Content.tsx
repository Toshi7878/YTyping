"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { Box, useBreakpointValue } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { useIsLoadingOverlayState, useSetMap } from "../atom/stateAtoms";

interface ContentProps {
  mapInfo: RouterOutPuts["map"]["getMapInfo"];
}

function Content({ mapInfo }: ContentProps) {
  const { video_id } = mapInfo!;

  const { id: mapId } = useParams();

  const isLoadingOverlay = useIsLoadingOverlayState();
  const layoutMode = useBreakpointValue({ base: "column", md: "row" });
  const [ytLayoutMode, setStartedYTLayoutMode] = useState(layoutMode);
  const setMap = useSetMap();

  return <Box></Box>;
}

export default Content;
