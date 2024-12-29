"use client";
import { Box } from "@chakra-ui/react";
import nProgress from "nprogress";
import { useEffect } from "react";
import ProfileSettingCard from "./profile-settings/ProfileSettingCard";

const Content = () => {
  useEffect(() => {
    window.getSelection()!.removeAllRanges();
    nProgress.done();
  }, []);

  return (
    <Box width={{ base: "100%", md: "90vw", "2xl": "65vw" }}>
      <ProfileSettingCard />
    </Box>
  );
};

export default Content;
