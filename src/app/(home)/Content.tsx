"use client";
import { Box } from "@chakra-ui/react";
import MapList from "./components/MapList";
import SearchContent from "./components/search/SearchContent";

export default function Content() {
  return (
    <Box width={{ base: "100%", sm: "90%", md: "95%", lg: "90%", xl: "80%" }}>
      <SearchContent />
      <MapList />
    </Box>
  );
}
