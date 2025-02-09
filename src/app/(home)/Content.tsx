"use client";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import MapList from "./components/MapList";
import SearchContent from "./components/SearchContent";

export default function Content() {
  useEffect(() => {
    window.getSelection()!.removeAllRanges();
  }, []);

  return (
    <Box width={{ base: "100%", sm: "90%", md: "95%", lg: "90%", xl: "80%" }}>
      <SearchContent />
      <MapList />
    </Box>
  );
}
