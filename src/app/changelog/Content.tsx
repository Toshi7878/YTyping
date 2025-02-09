"use client";
import { Box } from "@chakra-ui/react";
import nProgress from "nprogress";
import { useEffect } from "react";
import ContentHeading from "./_components/Heading";
import UpdateHistory from "./_components/UpdateHistory";

const Content = () => {
  useEffect(() => {
    window.getSelection()!.removeAllRanges();
    nProgress.done();
  }, []);

  return (
    <Box as="article">
      <ContentHeading />
      <UpdateHistory />
    </Box>
  );
};

export default Content;
