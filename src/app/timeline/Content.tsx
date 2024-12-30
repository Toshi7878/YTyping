"use client";
import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import UsersResultList from "./_components/UsersResultList";

export default function Content() {
  useEffect(() => {
    window.getSelection()!.removeAllRanges();
  }, []);

  return (
    <Box as="main" width={{ base: "100%", md: "90vw", "2xl": "65vw" }}>
      <UsersResultList />
    </Box>
  );
}
