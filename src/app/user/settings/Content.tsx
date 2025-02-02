"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { Stack } from "@chakra-ui/react";
import nProgress from "nprogress";
import { useEffect } from "react";
import OptionSettingCard from "./_components/option-settings/OptionSettingCard";
import ProfileSettingCard from "./_components/profile-settings/ProfileSettingCard";

interface ContentProps {
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
}

const Content = ({ userOptions }: ContentProps) => {
  useEffect(() => {
    window.getSelection()!.removeAllRanges();
    nProgress.done();
  }, []);

  return (
    <Stack width={{ base: "100%", md: "90vw", "2xl": "65vw" }} spacing={4}>
      <ProfileSettingCard />
      <OptionSettingCard userOptions={userOptions} />
    </Stack>
  );
};

export default Content;
