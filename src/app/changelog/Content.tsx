"use client";
import { Box } from "@chakra-ui/react";
import ContentHeading from "./_components/Heading";
import UpdateHistory from "./_components/UpdateHistory";

const Content = () => {
  return (
    <Box as="article">
      <ContentHeading />
      <UpdateHistory />
    </Box>
  );
};

export default Content;
