"use client";
import { RouterOutPuts } from "@/server/api/trpc";
import { Stack } from "@chakra-ui/react";
import OptionSettingCard from "./_components/option-settings/OptionSettingCard";
import ProfileSettingCard from "./_components/profile-settings/ProfileSettingCard";

interface ContentProps {
  userOptions: RouterOutPuts["userOption"]["getUserOptions"];
  userProfile: RouterOutPuts["user"]["getUserProfile"];
}

const Content = ({ userOptions, userProfile }: ContentProps) => {
  return (
    <Stack width={{ base: "100%", md: "70%" }} spacing={4} pt={4}>
      <ProfileSettingCard userProfile={userProfile} />
      <OptionSettingCard userOptions={userOptions} />
    </Stack>
  );
};

export default Content;
