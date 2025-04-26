"use client";
import { Box } from "@chakra-ui/react";
import UsersResultList from "./_components/UsersResultList";
import SearchContent from "./_components/search/SearchContent";

export default function Content() {
  return (
    <Box width={{ base: "100%", lg: "85%", xl: "65%" }}>
      <SearchContent />
      <UsersResultList />
    </Box>
  );
}
